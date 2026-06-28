-- calls.lua - Voice call system (replicated from n3xt_celular)
local callTimers = {}

-- Dial number
addEvent("Ophone.dialNumber", true)
addEventHandler("Ophone.dialNumber", root, function(number)
    local account = getAccountName(source)
    if not account then return end

    -- Check SIM
    local sim = dbPoll(dbQuery(db, "SELECT * FROM sim_cards WHERE account=? AND active=1", account), -1)
    if not sim or #sim == 0 then
        triggerClientEvent(source, "Ophone.notify", resourceRoot, "No active SIM!", "error")
        return
    end

    -- Check calls remaining
    local planName = sim[1]["recharge_plan"] or ""
    if planName ~= "" then
        local planKey = string.lower(planName)
        local plan = config.recharge_plans[planKey]
        if plan and plan.max_calls_week > 0 then
            local callsUsed = tonumber(sim[1]["calls_used"]) or 0
            if callsUsed >= plan.max_calls_week then
                triggerClientEvent(source, "Ophone.notify", resourceRoot, "No calls remaining! Recharge your plan.", "error")
                return
            end
        end
    end

    -- Validate number
    local num = tonumber(number)
    if not num or num <= 998000 then
        triggerClientEvent(source, "Ophone.notify", resourceRoot, "Invalid number!", "error")
        return
    end

    -- Can't call yourself
    if sim[1]["phone_number"] == number then
        triggerClientEvent(source, "Ophone.notify", resourceRoot, "You can't call yourself!", "error")
        return
    end

    -- Find target player
    local target = nil
    local targetData = nil
    for _, player in ipairs(getElementsByType("player")) do
        local pAcc = getAccountName(player)
        if pAcc then
            local pSim = dbPoll(dbQuery(db, "SELECT * FROM sim_cards WHERE account=? AND active=1", pAcc), -1)
            if pSim and #pSim > 0 and pSim[1]["phone_number"] == number then
                target = player
                targetData = pSim[1]
                break
            end
        end
    end

    if not target then
        triggerClientEvent(source, "Ophone.notify", resourceRoot, "Phone number not found!", "error")
        return
    end

    -- Check if target already in call
    if getElementData(target, "Ophone.emChamada") then
        triggerClientEvent(source, "Ophone.notify", resourceRoot, "This person is on another call!", "error")
        return
    end

    -- Check if target has disabled receiving calls
    if getElementData(target, "cancelReceiveCall") then
        triggerClientEvent(source, "Ophone.notify", resourceRoot, "This person has disabled incoming calls!", "error")
        return
    end

    -- Check if target has signal (rough check - tower system)
    if not hasPlayerSignal(target) then
        triggerClientEvent(source, "Ophone.notify", resourceRoot, "Cannot reach this number!", "error")
        return
    end

    -- Set call state on both players
    setElementData(source, "Ophone.emChamada", { player = target, number = number, accepted = false })
    setElementData(target, "Ophone.emChamada", { player = source, number = sim[1]["phone_number"], accepted = false })

    -- Get caller display name
    local phone = dbPoll(dbQuery(db, "SELECT display_name FROM phones WHERE account=?", account), -1)
    local callerName = (phone and phone[1] and phone[1]["display_name"]) or account

    -- Notify both
    triggerClientEvent(source, "Ophone.showOutgoingCall", resourceRoot, callerName)
    triggerClientEvent(target, "Ophone.incomingCall", resourceRoot, {
        display_name = callerName,
        phone_number = sim[1]["phone_number"],
        account = account
    })

    -- Play ring sound for caller
    triggerClientEvent(source, "Ophone.playSound", resourceRoot, "chamando", true)
    -- Play ringtone for receiver
    local targetAcc = getAccountName(target)
    if targetAcc then
        local targetPhone = dbPoll(dbQuery(db, "SELECT ringtone FROM phones WHERE account=?", targetAcc), -1)
        local ringtone = (targetPhone and targetPhone[1] and targetPhone[1]["ringtone"]) or "chamada_01"
        triggerClientEvent(target, "Ophone.playSound", resourceRoot, ringtone, true)
    end
end)

-- Accept call
addEvent("Ophone.acceptCall", true)
addEventHandler("Ophone.acceptCall", root, function()
    local callData = getElementData(source, "Ophone.emChamada")
    if not callData or not callData.player then return end
    if not isElement(callData.player) then
        setElementData(source, "Ophone.emChamada", nil)
        return
    end

    -- Mark as accepted
    setElementData(source, "Ophone.emChamada", { player = callData.player, number = callData.number, accepted = true })
    setElementData(callData.player, "Ophone.emChamada", { player = source, number = callData.number, accepted = true })

    -- Increment call usage
    local account = getAccountName(source)
    if account then
        dbExec(db, "UPDATE sim_cards SET calls_used = calls_used + 1 WHERE account=?", account)
    end

    -- Stop sounds and notify
    triggerClientEvent(source, "Ophone.stopSound", resourceRoot)
    triggerClientEvent(callData.player, "Ophone.stopSound", resourceRoot)
    triggerClientEvent(source, "Ophone.callAccepted", resourceRoot)
    triggerClientEvent(callData.player, "Ophone.callAccepted", resourceRoot)

    -- Start call timer
    callTimers[source] = { start = getTickCount(), other = callData.player }
    callTimers[callData.player] = { start = getTickCount(), other = source }
end)

-- End call
addEvent("Ophone.endCall", true)
addEventHandler("Ophone.endCall", root, function()
    local callData = getElementData(source, "Ophone.emChamada")
    if callData and callData.player and isElement(callData.player) then
        -- Stop sounds
        triggerClientEvent(source, "Ophone.stopSound", resourceRoot)
        triggerClientEvent(callData.player, "Ophone.stopSound", resourceRoot)

        -- Clear state
        setElementData(source, "Ophone.emChamada", nil)
        setElementData(callData.player, "Ophone.emChamada", nil)

        -- Notify both
        triggerClientEvent(source, "Ophone.callEnded", resourceRoot)
        triggerClientEvent(callData.player, "Ophone.callEnded", resourceRoot)

        -- Clean up timers
        callTimers[source] = nil
        callTimers[callData.player] = nil
    else
        setElementData(source, "Ophone.emChamada", nil)
        triggerClientEvent(source, "Ophone.callEnded", resourceRoot)
        callTimers[source] = nil
    end
end)

-- Clean up on disconnect
addEventHandler("onPlayerQuit", root, function()
    local callData = getElementData(source, "Ophone.emChamada")
    if callData and callData.player and isElement(callData.player) then
        setElementData(callData.player, "Ophone.emChamada", nil)
        triggerClientEvent(callData.player, "Ophone.callEnded", resourceRoot)
        triggerClientEvent(callData.player, "Ophone.stopSound", resourceRoot)
        callTimers[callData.player] = nil
    end
    callTimers[source] = nil
end)

-- Check if player has signal (rough proximity check for calls)
function hasPlayerSignal(player)
    if not isElement(player) then return false end
    local px, py, pz = getElementPosition(player)
    for _, tower in ipairs(config.towers) do
        local dist = getDistanceBetweenPoints3D(px, py, pz, tower.x, tower.y, tower.z)
        if dist <= tower.radius then
            return true
        end
    end
    return false
end

-- Play/stop sound events (client handles actual playback)
addEvent("Ophone.playSound", true)
addEventHandler("Ophone.playSound", root, function(soundName, loop)
    -- Client plays the sound via executeBrowserJavascript or playSound
end)

addEvent("Ophone.stopSound", true)
addEventHandler("Ophone.stopSound", root, function()
    -- Client stops sounds
end)
