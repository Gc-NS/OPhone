# OPhone - iOS-Inspired Phone System for MTA:SA

A high-performance, iOS-inspired smartphone interface for Multi Theft Auto: San Andreas, designed to run smoothly even on low-end hardware.

## 🚀 Features

### UI/UX
- **iOS-Inspired Design**: Authentic look with SF Pro fonts, rounded icons, frosted glass effects, and Dynamic Island
- **Responsive Scaling**: Automatically scales to 20% of screen height, centered on any resolution
- **Smooth Animations**: GPU-accelerated CSS transforms (transform/opacity) for 60fps performance
- **Lock Screen**: Swipe-up gesture to unlock with haptic feedback simulation
- **Home Screen**: Grid layout with app icons and dock
- **App System**: Fully functional apps with back navigation

### Apps Included
- 📞 **Phone** - Dialer and call history
- 💬 **Messages** - SMS conversation interface
- ⚙️ **Settings** - System configuration
- 📷 **Camera** - Camera interface (integration ready)
- 🖼️ **Gallery** - Photo viewer
- 📱 **SIM** - SIM card management
- 📸 **Instagram** - Social media feed
- 🎬 **Shorts** - Video feed
- 🧅 **Onion** - Browser/Anonymous browsing
- 🛍️ **App Store** - App installation interface
- 📧 **Mail** - Email client

### Performance Optimizations
- **Zero Dependencies**: Pure vanilla JavaScript, no frameworks
- **Single File UI**: Self-contained HTML/CSS/JS for fast loading
- **Lazy Rendering**: Apps only render when opened
- **Hardware Acceleration**: CSS-only animations using transform/opacity
- **Efficient DOM**: Batched updates with innerHTML
- **Lightweight Assets**: CSS gradients instead of heavy images
- **Minimal Processes**: No continuous loops or heavy polling

## 📁 Project Structure

```
ophone/
├── meta.xml              # Resource metadata and file declarations
├── client.lua            # Client-side logic, browser creation, event handling
├── server.lua            # Server-side logic, API endpoints, data management
├── README.md             # This file
├── Ophone.svg            # Phone frame SVG asset
└── html/
    └── index.html        # Complete UI (HTML/CSS/JS in one file)
```

## 🛠️ Installation

1. **Download the resource** to your MTA:SA server's `resources` folder
2. **Ensure files are present**:
   - `Ophone.svg` in the root directory
   - `html/index.html` exists
3. **Add to server.cfg** or start manually:
   ```
   start ophone
   ```
4. **Verify in F8 console** that the resource starts without errors

## 🎮 Usage

### Controls
- **Open/Close Phone**: Press configured keybind (default: `F7` - check `client.lua`)
- **Unlock Phone**: Swipe up on the home indicator (click and drag up)
- **Open App**: Click on any app icon
- **Go Back**: Click the back arrow or swipe from left edge
- **Go Home**: Click the home bar at the bottom

### Debug Mode
The system includes comprehensive debug logging:
- **Chat Messages**: "Phone is open/close" toggles
- **F8 Console**: 
  - "Loading phone UI..."
  - "Creating browser..."
  - "Loading HTML UI..."
  - "Phone UI downloaded and ready!"
  - "Browser loading state: false/true"
  - JavaScript console logs for app interactions

### Customization

#### Change Keybind
Edit `client.lua`:
```lua
local PHONE_KEY = "F7" -- Change to your preferred key

addCommandHandler("togglephone", function()
    togglePhone()
end)
bindKey(PHONE_KEY, "down", "togglephone")
```

#### Adjust Phone Size
Edit `client.lua` in `togglePhone()`:
```lua
local screenHeight = guiGetScreenHeight()
local phoneHeight = screenHeight * 0.20 -- Change 0.20 to adjust size (20% of screen)
```

#### Modify Colors/Theme
Edit `html/index.html` CSS variables:
```css
:root {
    --primary-color: #007AFF; /* iOS blue */
    --bg-color: #000000;
    --text-color: #FFFFFF;
    /* Add your custom colors */
}
```

## 🔌 Integration with MTA

### Event System

#### From Lua to JavaScript
```lua
executeBrowserJavascript(browser, "window.oponeTrigger('eventName', arg1, arg2)")
```

#### From JavaScript to Lua
```javascript
// In index.html
mta.triggerEvent('eventName', data1, data2);
```

#### Registered Events
- `openPhone` / `closePhone` - Toggle phone visibility
- `incomingCall` - Display incoming call screen
- `updateData` - Refresh phone data (messages, contacts, etc.)
- `notification` - Show notification banner

### Adding New Apps

1. **Add icon to home screen** in `renderHomeScreen()`:
```javascript
{ id: 'myapp', name: 'My App', icon: '🚀', color: '#FF5733' }
```

2. **Create app view** in `renderApp()`:
```javascript
case 'myapp':
    return `
        <div class="app-view">
            <div class="app-header">
                <button class="back-btn" onclick="goHome()">←</button>
                <span>My App</span>
            </div>
            <div class="app-content">
                <!-- Your app content -->
            </div>
        </div>
    `;
```

3. **Add Lua backend** (optional):
```lua
addEvent("onMyAppAction", true)
addEventHandler("onMyAppAction", root, function(data)
    -- Handle app logic
end)
```

## 🐛 Troubleshooting

### Phone doesn't open
1. Check F8 console for errors
2. Verify `html/index.html` exists
3. Ensure `meta.xml` includes `<file src="html/index.html" />`
4. Look for debug messages: "Phone UI downloaded and ready!"
5. Confirm browser loading state shows `false` (fully loaded)

### UI appears black/blank
1. Check that `Ophone.svg` exists in resource root
2. Verify `html,body { background: transparent !important; }` in CSS
3. Ensure browser is created with `isLocal=true` and `transparent=true`

### Lag on low-end PCs
1. Close other resources to test isolation
2. Reduce phone size multiplier in `client.lua`
3. Check F8 for JavaScript errors causing loops
4. Verify no external resources are being loaded

### Cursor stuck visible
1. Toggle phone off/on with keybind
2. Check `showCursor(false)` is called in `closePhone()`
3. Restart resource if issue persists

## 📚 Technical Details

### Browser Implementation
- Uses `createBrowser` with transparency enabled
- Renders via `dxDrawImage` with SVG mask
- Positioned center-screen, scaled to 20% viewport height
- JavaScript bridge via `executeBrowserJavascript` and `window.oponeTrigger`

### Performance Budget
- **Initial Load**: < 100ms on modern hardware, < 500ms on low-end
- **Frame Rate**: Consistent 60fps during animations
- **Memory**: < 10MB RAM usage
- **Draw Calls**: Minimal through CSS compositing

### Compatibility
- **MTA:SA**: 1.5.9+ recommended
- **Client**: Windows/Linux/Mac
- **Resolution**: Any (responsive scaling)
- **GPU**: Integrated graphics supported

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test on low-end hardware before submitting
4. Ensure no new dependencies are added
5. Submit pull request with description of changes

## 📄 License

This project is proprietary software for MTA:SA servers. All rights reserved.

## 🙏 Credits

- **Design Inspiration**: Apple iOS
- **Framework**: Multi Theft Auto: San Andreas
- **Optimization**: Built for low-end hardware compatibility

---

**Need Help?** Check the F8 console for detailed debug logs or contact the development team.
