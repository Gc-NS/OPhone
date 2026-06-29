local screenX, screenY = guiGetScreenSize()
-- Scale phone to fit screen better - use 20% of screen height as base
local phoneH = math.floor(screenY * 0.20)
local phoneW = math.floor(phoneH * (280 / 604)) -- Maintain aspect ratio
local phoneX = math.floor((screenX - phoneW) / 2) -- Center horizontally
local phoneY = math.floor((screenY - phoneH) / 2) -- Center vertically

local browser = nil
local isOpen = false
local isLoading = false
local phoneData = nil
local battery = 100
local signal = 100
local emChamada = nil

function openPhone()
    if isOpen or isLoading then 
        outputChatBox("#0a84ff[Debug] #ffffffPhone already open or loading...", 255, 255, 255, true)
        return 
    end
    if getElementData(localPlayer, "isPlayerCarry") then
        outputChatBox("#ff453a[Ophone] #ffffffCannot use phone while being carried", 255, 255, 255, true)
        return
    end
    isLoading = true
    outputChatBox("#0a84ff[Debug] #ffffffLoading phone UI...", 255, 255, 255, true)
    triggerServerEvent("Ophone.requestData", localPlayer)
end

addEvent("Ophone.open", true)
addEventHandler("Ophone.open", root, function(data)
    if isOpen then 
        isLoading = false
        return 
    end
    isOpen = true
    isLoading = false
    phoneData = data

    outputChatBox("#0a84ff[Debug] #ffffffCreating browser (" .. phoneW .. "x" .. phoneH .. ")...", 255, 255, 255, true)
    browser = createBrowser(phoneW, phoneH, true, false, true)
    
    -- Add debug for browser creation
    if not browser then
        outputChatBox("#ff453a[Error] #ffffffFailed to create browser!", 255, 255, 255, true)
        isOpen = false
        isLoading = false
        return
    end
    
    outputChatBox("#0a84ff[Debug] #ffffffLoading HTML UI...", 255, 255, 255, true)
    local loaded = loadBrowserURL(browser, "http://mta/local/html/index.html")
    if not loaded then
        outputChatBox("#ff453a[Error] #ffffffFailed to load browser URL!", 255, 255, 255, true)
        isOpen = false
        isLoading = false
        destroyElement(browser)
        browser = nil
        return
    end
    
    showCursor(true, true)

    local function onDocumentReady()
        removeEventHandler("onClientBrowserDocumentReady", browser, onDocumentReady)
        outputChatBox("#0a84ff[Debug] #ffffffPhone UI downloaded and ready!", 255, 255, 255, true)
        outputChatBox("#0a84ff[Debug] #ffffffBrowser loading state: " .. tostring(browserIsLoading(browser)), 255, 255, 255, true)
        local jsonData = toJSON(data)
        executeBrowserJavascript(browser, "window.oponeTrigger('Ophone.onOpen'," .. jsonData .. ")")
        addEventHandler("onClientRender", root, updateBattery)
        addEventHandler("onClientRender", root, updateSignal)
    end
    
    addEventHandler("onClientBrowserDocumentReady", browser, onDocumentReady)
    
    triggerServerEvent("Ophone.setAnimationPhone", localPlayer, 1)
end)

function renderPhone()
    if not isOpen or not browser then return end
    dxDrawImage(phoneX, phoneY, phoneW, phoneH, browser, 0, 0, 0, tocolor(255,255,255,255))
end

addEventHandler("onClientRender", root, renderPhone)

addEvent("Ophone.close", true)
addEventHandler("Ophone.close", root, function()
    closePhone()
end)

function closePhone()
    if not isOpen then return end
    if emChamada then return end
    isOpen = false
    if browser then
        showCursor(false)
        destroyElement(browser)
        browser = nil
    end
    removeEventHandler("onClientRender", root, renderPhone)
    removeEventHandler("onClientRender", root, updateBattery)
    removeEventHandler("onClientRender", root, updateSignal)
    triggerServerEvent("Ophone.setAnimationPhone", localPlayer, 2)
    phoneData = nil
end

local lastDrain = getTickCount()
function updateBattery()
    local now = getTickCount()
    local dt = (now - lastDrain) / 1000
    lastDrain = now
    local drainRate = config.battery_drain_idle
    if isOpen then drainRate = config.battery_drain_open end
    if emChamada then drainRate = config.battery_drain_call end
    local charging = false
    local px, py, pz = getElementPosition(localPlayer)
    for _, spot in ipairs(config.charger_spots) do
        local dist = getDistanceBetweenPoints3D(px, py, pz, spot.x, spot.y, spot.z)
        if dist <= spot.radius then charging = true; break end
    end
    if charging then battery = math.min(100, battery + config.charger_recharge_rate * dt)
    else battery = math.max(0, battery - drainRate * dt) end
    if battery <= 0 and isOpen then closePhone(); outputChatBox("#ff453a[Ophone] #ffffffBattery dead!", 255, 255, 255, true); return end
    if browser and isOpen then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.batteryUpdate'," .. math.floor(battery) .. ")") end
end

local lastSignalCheck = getTickCount()
function updateSignal()
    local now = getTickCount()
    if now - lastSignalCheck < 2000 then return end
    lastSignalCheck = now
    local px, py, pz = getElementPosition(localPlayer)
    local bestSignal = 0
    for _, tower in ipairs(config.towers) do
        local dist = getDistanceBetweenPoints3D(px, py, pz, tower.x, tower.y, tower.z)
        if dist <= tower.radius then
            local ratio = 1 - (dist / tower.radius)
            local strength = ratio * tower.strength
            if strength > bestSignal then bestSignal = strength end
        end
    end
    signal = bestSignal
    if browser and isOpen then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.signalUpdate'," .. math.floor(signal) .. ")") end
end

addEvent("Ophone.jsCall", true)
addEventHandler("Ophone.jsCall", root, function(eventName, argsJson)
    local args = {}
    if argsJson and argsJson ~= "" then args = fromJSON(argsJson) or {} end
    handleJsCall(eventName, args)
end)

function handleJsCall(name, args)
    if name == "Ophone.onClose" then closePhone()
    elseif name == "Ophone.unlock" then
        -- Unlock phone - just navigate to home screen, don't close the phone
        if browser then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.unlocked')") end
    elseif name == "Ophone.dialNumber" then
        local number = args[1]
        if not number or number == "" then return end
        if signal <= 0 then notifyJS("No signal!", "error"); return end
        if phoneData and phoneData.sim_active and phoneData.calls_remaining == 0 then notifyJS("No calls remaining!", "error"); return end
        triggerServerEvent("Ophone.dialNumber", localPlayer, number)
    elseif name == "Ophone.acceptCall" then triggerServerEvent("Ophone.acceptCall", localPlayer)
    elseif name == "Ophone.endCall" then
        triggerServerEvent("Ophone.endCall", localPlayer)
        emChamada = nil
        if browser then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.callEnded')") end
    elseif name == "Ophone.addContact" then triggerServerEvent("Ophone.addContact", localPlayer, args[1], args[2])
    elseif name == "Ophone.deleteContact" then triggerServerEvent("Ophone.deleteContact", localPlayer, args[1])
    elseif name == "Ophone.sendMessage" then
        if signal <= 0 then notifyJS("No signal!", "error"); return end
        if phoneData and phoneData.sim_active == false then notifyJS("No SIM!", "error"); return end
        triggerServerEvent("Ophone.sendMessage", localPlayer, args[1], args[2])
    elseif name == "Ophone.sendMail" then
        if signal <= 0 then notifyJS("No signal!", "error"); return end
        triggerServerEvent("Ophone.sendMail", localPlayer, args[1], args[2], args[3])
    elseif name == "Ophone.deleteMail" then triggerServerEvent("Ophone.deleteMail", localPlayer, args[1])
    elseif name == "Ophone.activateSim" then triggerServerEvent("Ophone.activateSim", localPlayer)
    elseif name == "Ophone.rechargePlan" then triggerServerEvent("Ophone.rechargePlan", localPlayer, args[1])
    elseif name == "Ophone.takeScreenshot" then takeScreenshot()
    elseif name == "Ophone.deleteScreenshot" then triggerServerEvent("Ophone.deleteScreenshot", localPlayer, args[1])
    elseif name == "Ophone.setWallpaper" then triggerServerEvent("Ophone.setWallpaper", localPlayer, args[1], args[2])
    elseif name == "Ophone.setWallpaperUrl" then triggerServerEvent("Ophone.setWallpaperUrl", localPlayer, args[1], args[2])
    elseif name == "Ophone.igCreatePost" then triggerServerEvent("Ophone.igCreatePost", localPlayer, args[1], args[2], args[3], args[4], args[5])
    elseif name == "Ophone.igLike" then triggerServerEvent("Ophone.igLike", localPlayer, args[1])
    elseif name == "Ophone.igUnlike" then triggerServerEvent("Ophone.igUnlike", localPlayer, args[1])
    elseif name == "Ophone.igDeletePost" then triggerServerEvent("Ophone.igDeletePost", localPlayer, args[1])
    elseif name == "Ophone.igComment" then triggerServerEvent("Ophone.igComment", localPlayer, args[1], args[2])
    elseif name == "Ophone.igFollow" then triggerServerEvent("Ophone.igFollow", localPlayer, args[1])
    elseif name == "Ophone.igUnfollow" then triggerServerEvent("Ophone.igUnfollow", localPlayer, args[1])
    elseif name == "Ophone.igUpdateProfile" then triggerServerEvent("Ophone.igUpdateProfile", localPlayer, args[1], args[2], args[3])
    elseif name == "Ophone.shortsCreatePost" then triggerServerEvent("Ophone.shortsCreatePost", localPlayer, args[1], args[2], args[3], args[4], args[5], args[6])
    elseif name == "Ophone.shortsLike" then triggerServerEvent("Ophone.shortsLike", localPlayer, args[1])
    elseif name == "Ophone.shortsUnlike" then triggerServerEvent("Ophone.shortsUnlike", localPlayer, args[1])
    elseif name == "Ophone.onionPost" then triggerServerEvent("Ophone.onionPost", localPlayer, args[1])
    elseif name == "Ophone.onionLike" then triggerServerEvent("Ophone.onionLike", localPlayer, args[1])
    elseif name == "Ophone.installApp" then triggerServerEvent("Ophone.installApp", localPlayer, args[1])
    elseif name == "Ophone.setRingtone" then triggerServerEvent("Ophone.setRingtone", localPlayer, args[1])
    elseif name == "Ophone.setNotificationSound" then triggerServerEvent("Ophone.setNotificationSound", localPlayer, args[1])
    elseif name == "Ophone.toggleReceiveCalls" then setElementData(localPlayer, "cancelReceiveCall", not args[1])
    elseif name == "Ophone.factoryReset" then triggerServerEvent("Ophone.factoryReset", localPlayer)
    elseif name == "Ophone.setDisplayName" then triggerServerEvent("Ophone.setDisplayName", localPlayer, args[1])
    end
end

function notifyJS(msg, type)
    if browser then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.notify','" .. msg .. "')") end
end

function takeScreenshot()
    if not isOpen then return end
    if browser then 
        -- Browser is rendered via dxDrawImage, no need to hide
        outputChatBox("#0a84ff[Debug] #ffffffTaking screenshot...", 255, 255, 255, true)
    end
    setTimer(function()
        local px, py, pz = getElementPosition(localPlayer)
        local rx, ry, rz = getElementRotation(localPlayer)
        takePlayerScreenShot(config.screenshot_width, config.screenshot_height, "screenshots/" .. getAccountName(getPlayerAccount(localPlayer)) .. "_" .. getTickCount() .. ".png", "JPEG", config.screenshot_quality)
    end, 200, 1)
end

addEvent("Ophone.screenshotTaken", true)
addEventHandler("Ophone.screenshotTaken", root, function(path)
    if browser and isOpen then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.screenshotSaved','" .. path .. "')") end
end)

addEvent("Ophone.incomingCall", true)
addEventHandler("Ophone.incomingCall", root, function(callerData)
    emChamada = { player = source, data = callerData }
    if not isOpen then triggerServerEvent("Ophone.requestData", localPlayer) end
    if browser then
        local name = callerData.display_name or callerData.username or callerData.phone_number or "Unknown"
        executeBrowserJavascript(browser, "ophoneTrigger('Ophone.incomingCall','" .. name .. "')")
    end
end)

addEvent("Ophone.callAccepted", true)
addEventHandler("Ophone.callAccepted", root, function()
    if browser then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.callAccepted')") end
end)

addEvent("Ophone.callEnded", true)
addEventHandler("Ophone.callEnded", root, function()
    emChamada = nil
    if browser then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.callEnded')") end
end)

addEvent("Ophone.showOutgoingCall", true)
addEventHandler("Ophone.showOutgoingCall", root, function(name)
    if browser then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.showOutgoingCall','" .. (name or "Unknown") .. "')") end
end)

addEvent("Ophone.notify", true)
addEventHandler("Ophone.notify", root, function(msg, type)
    notifyJS(msg, type)
end)

addEvent("Ophone.updateData", true)
addEventHandler("Ophone.updateData", root, function(data)
    phoneData = data
    if browser and isOpen then executeBrowserJavascript(browser, "ophoneTrigger('Ophone.updateData'," .. toJSON(data) .. ")") end
end)

bindKey(config.bind, "down", function()
    outputChatBox("#0a84ff[Debug] #ffffffPhone is " .. (isOpen and "close" or "open"), 255, 255, 255, true)
    if isOpen then closePhone() else openPhone() end
end)

addEventHandler("onResourceStop", resourceRoot, function()
    if isOpen then closePhone() end
end)

addEventHandler("onPlayerJoin", root, function()
    bindKey(source, config.bind, "down", function()
        outputChatBox("#0a84ff[Debug] #ffffffPhone is " .. (isOpen and "close" or "open"), 255, 255, 255, true)
        if isOpen then closePhone() else openPhone() end
    end)
end)

addEventHandler("onResourceStart", resourceRoot, function()
    for _, player in ipairs(getElementsByType("player")) do
        bindKey(player, config.bind, "down", function()
            outputChatBox("#0a84ff[Debug] #ffffffPhone is " .. (isOpen and "close" or "open"), 255, 255, 255, true)
            if isOpen then closePhone() else openPhone() end
        end)
    end
end)

function isPhoneOpen() return isOpen end
function getPhoneBrowser() return browser end
function getPhoneData() return phoneData end
function getSignal() return signal end
function getBattery() return battery end
function isInCall() return emChamada ~= nil end

local currentSounds = {}
addEvent("Ophone.playSound", true)
addEventHandler("Ophone.playSound", root, function(soundName, loop)
    stopAllSounds()
    local path = "files/sfx/" .. soundName .. ".mp3"
    local s = playSound(path, loop or false)
    if s then currentSounds[soundName] = s end
end)

addEvent("Ophone.stopSound", true)
addEventHandler("Ophone.stopSound", root, function()
    stopAllSounds()
end)

function stopAllSounds()
    for name, s in pairs(currentSounds) do
        if isElement(s) then stopSound(s) end
    end
    currentSounds = {}
end

addEvent("Ophone.showShop", true)
addEventHandler("Ophone.showShop", root, function()
    outputChatBox("#0a84ff[Ophone Shop] #ffffffType /ophonebuy phone or /ophonebuy sim", 255, 255, 255, true)
end)

addCommandHandler("ophonebuy", function(cmd, item)
    if item == "phone" then triggerServerEvent("Ophone.buyPhone", localPlayer)
    elseif item == "sim" then triggerServerEvent("Ophone.buySim", localPlayer)
    else outputChatBox("#0a84ff[Ophone Shop] #ffffffUsage: /ophonebuy phone | /ophonebuy sim", 255, 255, 255, true) end
end)

function getOphoneSignal() return signal end
function getOphoneBattery() return battery end
function isOphoneOpen() return isOpen end
