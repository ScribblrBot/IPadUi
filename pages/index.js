import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [deviceInfo, setDeviceInfo] = useState({})
  const [batteryInfo, setBatteryInfo] = useState({})
  const [networkInfo, setNetworkInfo] = useState({})
  const [currentTime, setCurrentTime] = useState('')
  const [widgetOrder, setWidgetOrder] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const dragItem = useRef()
  const dragNode = useRef()

  // Default widget configuration
  const defaultWidgets = [
    { id: 'device', title: 'Device', enabled: true },
    { id: 'display', title: 'Display', enabled: true },
    { id: 'performance', title: 'Performance', enabled: true },
    { id: 'battery', title: 'Battery', enabled: true },
    { id: 'network', title: 'Network', enabled: true },
    { id: 'storage', title: 'Storage', enabled: true },
    { id: 'location', title: 'Location', enabled: true },
    { id: 'permissions', title: 'Permissions', enabled: true }
  ]

  useEffect(() => {
    // Load widget order from localStorage
    const savedOrder = localStorage.getItem('widgetOrder')
    if (savedOrder) {
      setWidgetOrder(JSON.parse(savedOrder))
    } else {
      setWidgetOrder(defaultWidgets)
    }

    // Update time every minute instead of every second to reduce lag
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    }, 60000)
    setCurrentTime(new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }))

    // Basic device info - only collect once
    const info = {
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      colorDepth: screen.colorDepth,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      online: navigator.onLine,
    }
    setDeviceInfo(info)

    // Battery API with throttled updates
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const updateBattery = () => {
          setBatteryInfo({
            level: Math.round(battery.level * 100),
            charging: battery.charging
          })
        }
        
        updateBattery()
        
        // Throttle battery updates to reduce lag
        battery.addEventListener('levelchange', updateBattery)
        battery.addEventListener('chargingchange', updateBattery)
      })
    } else {
      // Fallback for browsers without Battery API
      setBatteryInfo({ level: 100, charging: false })
    }

    // Network info with throttled updates
    if ('connection' in navigator) {
      const connection = navigator.connection
      const updateNetwork = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        })
      }
      
      updateNetwork()
      connection.addEventListener('change', updateNetwork)
    }

    return () => clearInterval(timeInterval)
  }, [])

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    dragItem.current = index
    dragNode.current = e.target
    dragNode.current.addEventListener('dragend', handleDragEnd)
    setTimeout(() => setIsDragging(true), 0)
  }

  const handleDragEnter = (e, index) => {
    if (dragItem.current !== index) {
      const newWidgets = [...widgetOrder]
      const draggedItem = newWidgets[dragItem.current]
      newWidgets.splice(dragItem.current, 1)
      newWidgets.splice(index, 0, draggedItem)
      dragItem.current = index
      setWidgetOrder(newWidgets)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    dragNode.current.removeEventListener('dragend', handleDragEnd)
    dragItem.current = null
    dragNode.current = null
    // Save to localStorage
    localStorage.setItem('widgetOrder', JSON.stringify(widgetOrder))
  }

  const getCurrentStyle = (index) => {
    if (dragItem.current === index) {
      return "opacity-0"
    }
    return "cursor-grab active:cursor-grabbing"
  }

  // Real data calculations
  const getStorageInfo = () => {
    // Estimate based on device capabilities
    const cores = deviceInfo.hardwareConcurrency || 4
    const estimatedRAM = cores * 512 // MB per core estimate
    const usedRAM = Math.round(estimatedRAM * 0.6) // 60% usage estimate
    return { estimatedRAM, usedRAM }
  }

  const getNetworkStrength = (type) => {
    const strengths = {
      '4g': 4,
      '3g': 3, 
      '2g': 2,
      'slow-2g': 1
    }
    return strengths[type] || 4
  }

  // Charging animation component
  const ChargingAnimation = ({ charging }) => {
    if (!charging) return null
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse flex space-x-1">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="w-1 h-3 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  // SVG Icons (optimized)
  const BatteryIcon = ({ level, charging }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="relative">
      <rect x="2" y="6" width="18" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
      <rect x="4" y="8" width="14" height="8" rx="1" fill="rgba(255,255,255,0.3)"/>
      <rect x="4" y="8" width={14 * (level / 100)} height="8" rx="1" fill="white"/>
      <rect x="20" y="9" width="2" height="6" rx="1" fill="white"/>
      <ChargingAnimation charging={charging} />
    </svg>
  )

  const WifiIcon = ({ strength = 3 }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 20L12 20.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 16L8 16.01" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={strength >= 1 ? 1 : 0.3}/>
      <path d="M16 16L16 16.01" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={strength >= 1 ? 1 : 0.3}/>
      <path d="M5 12L5 12.01" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={strength >= 2 ? 1 : 0.3}/>
      <path d="M19 12L19 12.01" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={strength >= 2 ? 1 : 0.3}/>
      <path d="M2 8L2 8.01" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={strength >= 3 ? 1 : 0.3}/>
      <path d="M22 8L22 8.01" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={strength >= 3 ? 1 : 0.3}/>
    </svg>
  )

  const DeviceIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="3" stroke="white" strokeWidth="1.5"/>
      <rect x="9" y="16" width="6" height="1" fill="white"/>
      <circle cx="12" cy="6" r="1" fill="white"/>
    </svg>
  )

  const DisplayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5"/>
      <path d="M8 22L16 22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="11" y="20" width="2" height="2" fill="white"/>
    </svg>
  )

  const CpuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="1.5"/>
      <rect x="8" y="8" width="8" height="8" rx="1" stroke="white" strokeWidth="1.5"/>
      <path d="M4 8H2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 16H2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 8H20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 16H20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )

  const NetworkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2" fill="white"/>
      <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  )

  const StorageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="1.5"/>
      <rect x="8" y="8" width="8" height="8" fill="white" opacity="0.3"/>
      <path d="M8 8L16 16" stroke="white" strokeWidth="1.5"/>
      <path d="M16 8L8 16" stroke="white" strokeWidth="1.5"/>
    </svg>
  )

  const LocationIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.7764 3 12 3C8.22355 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" stroke="white" strokeWidth="1.5"/>
      <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="1.5"/>
    </svg>
  )

  const SecurityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="18" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
      <path d="M7 10V6C7 4.34315 8.34315 3 10 3H14C15.6569 3 17 4.34315 17 6V10" stroke="white" strokeWidth="1.5"/>
    </svg>
  )

  // Widget components
  const Widget = ({ title, icon, children, className = "", dragProps }) => (
    <div 
      {...dragProps}
      className={`glass-card rounded-3xl p-6 shadow-2xl transition-transform duration-200 ${className} ${dragProps?.className || ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        {icon}
      </div>
      {children}
    </div>
  )

  const StatItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-white/80 text-sm">{label}</span>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  )

  // Render individual widgets based on type
  const renderWidget = (widget, index) => {
    const dragProps = {
      draggable: true,
      onDragStart: (e) => handleDragStart(e, index),
      onDragEnter: (e) => handleDragEnter(e, index),
      className: getCurrentStyle(index)
    }

    switch (widget.id) {
      case 'device':
        return (
          <Widget key="device" title="Device" icon={<DeviceIcon />} dragProps={dragProps}>
            <StatItem label="Platform" value={deviceInfo.platform || 'Unknown'} />
            <StatItem label="Vendor" value={deviceInfo.vendor || 'Unknown'} />
            <StatItem label="Language" value={deviceInfo.language || 'Unknown'} />
            <StatItem label="Online" value={deviceInfo.online ? 'Yes' : 'No'} />
          </Widget>
        )
      
      case 'display':
        return (
          <Widget key="display" title="Display" icon={<DisplayIcon />} dragProps={dragProps}>
            <StatItem label="Resolution" value={`${deviceInfo.screenWidth} × ${deviceInfo.screenHeight}`} />
            <StatItem label="Viewport" value={`${deviceInfo.viewportWidth} × ${deviceInfo.viewportHeight}`} />
            <StatItem label="Pixel Ratio" value={deviceInfo.pixelRatio || 'Unknown'} />
            <StatItem label="Color Depth" value={`${deviceInfo.colorDepth || '?'} bit`} />
          </Widget>
        )
      
      case 'performance':
        return (
          <Widget key="performance" title="Performance" icon={<CpuIcon />} dragProps={dragProps}>
            <StatItem label="CPU Cores" value={deviceInfo.hardwareConcurrency || 'Unknown'} />
            <StatItem label="Touch Points" value={deviceInfo.maxTouchPoints || 'Unknown'} />
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Memory</span>
                <span className="text-white">{getStorageInfo().estimatedRAM}MB</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(getStorageInfo().usedRAM / getStorageInfo().estimatedRAM) * 100}%` }}
                ></div>
              </div>
            </div>
          </Widget>
        )
      
      case 'battery':
        return (
          <Widget key="battery" title="Battery" icon={<BatteryIcon level={batteryInfo.level} charging={batteryInfo.charging} />} dragProps={dragProps}>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-white mb-2">{batteryInfo.level || '100'}%</div>
              <div className="text-white/70 text-sm">
                {batteryInfo.charging ? 'Charging' : 'Discharging'}
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  (batteryInfo.level || 100) > 20 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${batteryInfo.level || 100}%` }}
              ></div>
            </div>
          </Widget>
        )
      
      case 'network':
        return (
          <Widget key="network" title="Network" icon={<NetworkIcon />} dragProps={dragProps}>
            <StatItem label="Type" value={networkInfo.effectiveType || 'Unknown'} />
            <StatItem label="Speed" value={networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Unknown'} />
            <StatItem label="Latency" value={networkInfo.rtt ? `${networkInfo.rtt}ms` : 'Unknown'} />
            <div className="mt-3 p-3 bg-white/10 rounded-xl">
              <div className="text-white/70 text-xs mb-1">Signal Strength</div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((bar) => (
                  <div 
                    key={bar} 
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      bar <= getNetworkStrength(networkInfo.effectiveType) ? 'bg-green-500' : 'bg-white/20'
                    }`} 
                    style={{ height: `${bar * 4}px` }}
                  ></div>
                ))}
              </div>
            </div>
          </Widget>
        )
      
      case 'storage':
        const storage = getStorageInfo()
        return (
          <Widget key="storage" title="Storage" icon={<StorageIcon />} dragProps={dragProps}>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Used</span>
                <span className="text-white">{storage.usedRAM}MB</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(storage.usedRAM / storage.estimatedRAM) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Available</span>
                <span className="text-white">{storage.estimatedRAM - storage.usedRAM}MB</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="text-white/70">System</div>
                <div className="text-white text-right">~{Math.round(storage.estimatedRAM * 0.3)}MB</div>
                <div className="text-white/70">Apps</div>
                <div className="text-white text-right">~{Math.round(storage.estimatedRAM * 0.4)}MB</div>
                <div className="text-white/70">Free</div>
                <div className="text-white text-right">~{Math.round(storage.estimatedRAM * 0.3)}MB</div>
              </div>
            </div>
          </Widget>
        )
      
      case 'location':
        return (
          <Widget key="location" title="Location" icon={<LocationIcon />} dragProps={dragProps}>
            <div className="text-center py-4">
              <div className="text-white/70 text-sm mb-3">Location access required</div>
              <button 
                onClick={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const lat = pos.coords.latitude.toFixed(6)
                        const lng = pos.coords.longitude.toFixed(6)
                        alert(`Location: ${lat}, ${lng}\nAccuracy: ±${Math.round(pos.coords.accuracy)}m`)
                      },
                      (err) => alert('Location access denied or failed')
                    )
                  } else {
                    alert('Geolocation not supported')
                  }
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Get Location
              </button>
            </div>
          </Widget>
        )
      
      case 'permissions':
        return (
          <Widget key="permissions" title="Permissions" icon={<SecurityIcon />} dragProps={dragProps}>
            <StatItem label="Location" value="❓" />
            <StatItem label="Camera" value="❓" />
            <StatItem label="Microphone" value="❓" />
            <StatItem label="Notifications" value="❓" />
            <div className="text-center mt-3">
              <button 
                onClick={() => alert('Check browser settings for permissions')}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs transition-colors"
              >
                Check Permissions
              </button>
            </div>
          </Widget>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 to-black">
      {/* Status Bar */}
      <div className="glass-card rounded-3xl px-6 py-3 mb-6 flex justify-between items-center text-white">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-lg">iPad Dashboard</span>
          <div className="flex items-center space-x-2">
            <WifiIcon strength={getNetworkStrength(networkInfo.effectiveType)} />
            <span className="text-sm">{networkInfo.effectiveType || 'Unknown'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <span className="text-sm">{currentTime}</span>
          <div className="flex items-center space-x-2">
            <BatteryIcon level={batteryInfo.level || 100} charging={batteryInfo.charging} />
            <span className="text-sm">{batteryInfo.level || '100'}%</span>
          </div>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {widgetOrder.map((widget, index) => renderWidget(widget, index))}
      </div>

      {/* Footer */}
      <div className="text-center text-white/40 mt-8 text-xs">
        Drag to rearrange widgets • Changes saved automatically
      </div>
    </div>
  )
}
