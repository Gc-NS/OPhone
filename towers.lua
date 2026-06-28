-- towers.lua - Tower/signal management
-- This file provides server-side signal checking utilities

function getPlayerSignalLevel(player)
    if not isElement(player) then return 0 end
    local px, py, pz = getElementPosition(player)
    local bestSignal = 0

    for _, tower in ipairs(config.towers) do
        local dist = getDistanceBetweenPoints3D(px, py, pz, tower.x, tower.y, tower.z)
        if dist <= tower.radius then
            local ratio = 1 - (dist / tower.radius)
            local strength = ratio * tower.strength
            if strength > bestSignal then
                bestSignal = strength
            end
        end
    end

    return bestSignal
end

function isPlayerInSignalRange(player)
    return getPlayerSignalLevel(player) > 0
end

-- Get all tower locations (for potential map blips)
function getTowerLocations()
    return config.towers
end

-- Check if a position has signal
function getPositionSignal(x, y, z)
    local bestSignal = 0
    for _, tower in ipairs(config.towers) do
        local dist = getDistanceBetweenPoints3D(x, y, z, tower.x, tower.y, tower.z)
        if dist <= tower.radius then
            local ratio = 1 - (dist / tower.radius)
            local strength = ratio * tower.strength
            if strength > bestSignal then
                bestSignal = strength
            end
        end
    end
    return bestSignal
end
