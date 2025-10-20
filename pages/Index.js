import { useState, useEffect } from 'react'

export default function Home() {
  const [deviceInfo, setDeviceInfo] = useState({})
  const [batteryInfo, setBatteryInfo] = useState({})
  const [networkInfo, setNetworkInfo] = useState({})
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    }, 1000)

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
    }
    setDeviceInfo(info)

    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setBatteryInfo({
          level: Math.round(battery.level * 100),
          charging: battery.charging
        })
        
        battery.addEventListener('levelchange', () => {
          setBatteryInfo(prev => ({...prev, level: Math.round(battery.level * 100)}))
        })
        battery.addEventListener('chargingchange', () => {
          setBatteryInfo(prev => ({...prev, charging: battery.charging}))
        })
      })
    }

    if ('connection' in navigator) {
      const connection = navigator.connection
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      })
    }

    return () => clearInterval(timeInterval)
  }, [])

  const BatteryIcon = ({ level, charging }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="18" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
      <rect x="4" y="8" width="14" height="8" rx="1" fill="rgba(255,255,255,0.3)"/>
      <rect x="4" y="8" width={14 * (level / 100)} height="8" rx="1" fill="white"/>
      {charging && (
        <path d="M11 6L13 6L12 10L16 8L13 12L11 12L12 8L8 10L11 6Z" fill="white"/>
      )}
      <rect x="20" y="9" width="2" height="6" rx="1" fill="white"/>
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
      <path d="M8 4V2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 4V2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 22V20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 22V20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )

  const NetworkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2" fill="white"/>
      <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="12" cy="12" r="12" stroke="white" strokeWidth="1.5" opacity="0.2"/>
    </svg>
  )

  const Widget = ({ title, icon, children, className = "" }) => (
    <div className={`glass-card rounded-3xl p-6 shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        {icon}
      </div>
      {children}
    </div>
  )

  const StatItem = ({ label, value, icon }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        {icon && <span className="mr-2 text-white/70">{icon}</span>}
        <span className="text-white/80 text-sm">{label}</span>
      </div>
      <span className="text-white font-medium">{value}</span>
    </div>
  )

  return (
    <div className="min-h-screen p-6">
      <div className="glass-card rounded-3xl px-6 py-3 mb-6 flex justify-between items-center text-white">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-lg">iPad</span>
          <div className="flex items-center space-x-2">
            <WifiIcon strength={3} />
            <span className="text-sm">{networkInfo.effectiveType || 'WiFi'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <span className="text-sm">{currentTime}</span>
          <div className="flex items-center space-x-2">
            <BatteryIcon level={batteryInfo.level} charging={batteryInfo.charging} />
            <span className="text-sm">{batteryInfo.level || '100'}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        
        <Widget title="Device" icon={<DeviceIcon />}>
          <StatItem label="Model" value={deviceInfo.platform || 'iPad'} icon="📱" />
          <StatItem label="Vendor" value={deviceInfo.vendor || 'Apple'} icon="🏢" />
          <StatItem label="Language" value={deviceInfo.language || 'en-US'} icon="🌐" />
          <StatItem label="Timezone" value={deviceInfo.timezone || 'UTC'} icon="🕐" />
        </Widget>

        <Widget title="Display" icon={<DisplayIcon />}>
          <StatItem label="Resolution" value={`${deviceInfo.screenWidth} × ${deviceInfo.screenHeight}`} icon="📐" />
          <StatItem label="Viewport" value={`${deviceInfo.viewportWidth} × ${deviceInfo.viewportHeight}`} icon="🔍" />
          <StatItem label="Pixel Ratio" value={deviceInfo.pixelRatio || '2'} icon="⚡" />
          <StatItem label="Color Depth" value={`${deviceInfo.colorDepth || '24'} bit`} icon="🎨" />
        </Widget>

        <Widget title="Performance" icon={<CpuIcon />}>
          <StatItem label="CPU Cores" value={deviceInfo.hardwareConcurrency || '8'} icon="🔢" />
          <StatItem label="Touch Points" value={deviceInfo.maxTouchPoints || '5'} icon="👆" />
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Memory</span>
              <span className="text-white">4GB</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
        </Widget>

        <Widget title="Battery" icon={<BatteryIcon level={batteryInfo.level} charging={batteryInfo.charging} />}>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-white mb-2">{batteryInfo.level || '100'}%</div>
            <div className="text-white/70 text-sm">
              {batteryInfo.charging ? 'Charging' : 'Battery'}
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${batteryInfo.level || 100}%` }}
            ></div>
          </div>
        </Widget>

        <Widget title="Network" icon={<NetworkIcon />}>
          <StatItem label="Type" value={networkInfo.effectiveType || 'WiFi'} icon="📶" />
          <StatItem label="Speed" value={networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Fast'} icon="⚡" />
          <StatItem label="Latency" value={networkInfo.rtt ? `${networkInfo.rtt}ms` : 'Low'} icon="⏱️" />
          <div className="mt-3 p-3 bg-white/10 rounded-xl">
            <div className="text-white/70 text-xs mb-1">Connection Quality</div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((bar) => (
                <div key={bar} className="flex-1 bg-green-500 rounded-full" style={{ height: `${bar * 6}px` }}></div>
              ))}
            </div>
          </div>
        </Widget>

        <Widget title="Storage" icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="1.5"/>
            <rect x="8" y="8" width="8" height="8" fill="white" opacity="0.3"/>
            <path d="M8 8L16 16" stroke="white" strokeWidth="1.5"/>
            <path d="M16 8L8 16" stroke="white" strokeWidth="1.5"/>
          </svg>
        }>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">64GB Used</span>
              <span className="text-white">128GB Total</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-purple-500 h-3 rounded-full w-1/2"></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-white/70">Apps</div>
              <div className="text-white text-right">32GB</div>
              <div className="text-white/70">Photos</div>
              <div className="text-white text-right">18GB</div>
              <div className="text-white/70">System</div>
              <div className="text-white text-right">14GB</div>
            </div>
          </div>
        </Widget>

      </div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="glass-card rounded-3xl px-8 py-4 flex space-x-8">
          {[DeviceIcon, DisplayIcon, CpuIcon, NetworkIcon].map((Icon, index) => (
            <div key={index} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
              <Icon />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
