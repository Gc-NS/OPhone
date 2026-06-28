local inv = exports.Reswininv
local db = nil

-- Database initialization
addEventHandler("onResourceStart", resourceRoot, function()
    db = dbConnect("sqlite", "files/celular.db")
    dbExec(db, "CREATE TABLE IF NOT EXISTS phones (account TEXT PRIMARY KEY, phone_number TEXT, wallpaper_lock TEXT DEFAULT 'default_lock', wallpaper_home TEXT DEFAULT 'default_home', ringtone TEXT DEFAULT 'chamada_01', notification_sound TEXT DEFAULT 'notify_01', display_name TEXT DEFAULT 'Player')")
    dbExec(db, "CREATE TABLE IF NOT EXISTS sim_cards (account TEXT PRIMARY KEY, phone_number TEXT, active INTEGER DEFAULT 0, recharge_plan TEXT, recharge_expiry TEXT, data_used REAL DEFAULT 0, calls_used INTEGER DEFAULT 0)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, name TEXT, phone_number TEXT, is_emergency INTEGER DEFAULT 0)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_number TEXT, receiver_number TEXT, content TEXT, read INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS mail (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_number TEXT, sender_name TEXT, receiver_number TEXT, subject TEXT, content TEXT, read INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS phone_index (current_index INTEGER DEFAULT 998000)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS screenshots (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, filename TEXT, taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS instagram_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, username TEXT, post_type TEXT, media_path TEXT, media_url TEXT, caption TEXT, bg_color TEXT, likes_count INTEGER DEFAULT 0, comments_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS instagram_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, account TEXT, username TEXT, content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS instagram_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, account TEXT)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS instagram_follows (id INTEGER PRIMARY KEY AUTOINCREMENT, follower_account TEXT, following_account TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS instagram_profiles (account TEXT PRIMARY KEY, username TEXT, display_name TEXT, bio TEXT, avatar_path TEXT)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS shorts_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, username TEXT, post_type TEXT, media_path TEXT, media_url TEXT, caption TEXT, bg_color TEXT, bg_gradient TEXT, font_style TEXT, likes_count INTEGER DEFAULT 0, views_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS shorts_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, account TEXT)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS onion_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, account TEXT, likes INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS onion_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, account TEXT)")
    dbExec(db, "CREATE TABLE IF NOT EXISTS installed_apps (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, app_id TEXT)")

    -- Cleanup expired onion posts
    local hours = config.onion_post_expiry_hours
    dbExec(db, "DELETE FROM onion_posts WHERE created_at < datetime('now', '-' || ? || ' hours')", hours)

    -- Initialize phone index
    local result = dbPoll(dbQuery(db, "SELECT current_index FROM phone_index"), -1)
    if #result == 0 then
        dbExec(db, "INSERT INTO phone_index (current_index) VALUES (998000)")
    end
end)

-- Helper functions
local function getPlayerAccountName(player)
    local acc = getPlayerAccount(player)
    if acc and not isGuestAccount(acc) then
        return getAccountName(acc)
    end
    return nil
end

local function getNextPhoneIndex()
    local result = dbPoll(dbQuery(db, "SELECT current_index FROM phone_index"), -1)
    local idx = (result and result[1] and tonumber(result[1]["current_index"])) or 998000
    idx = idx + 1
    dbExec(db, "UPDATE phone_index SET current_index = ?", idx)
    return tostring(idx)
end

local function getPlayerPhoneData(account)
    if not account then return nil end
    local phone = dbPoll(dbQuery(db, "SELECT * FROM phones WHERE account=?", account), -1)
    local sim = dbPoll(dbQuery(db, "SELECT * FROM sim_cards WHERE account=?", account), -1)
    local contacts = dbPoll(dbQuery(db, "SELECT * FROM contacts WHERE account=?", account), -1)
    local screenshots = dbPoll(dbQuery(db, "SELECT * FROM screenshots WHERE account=? ORDER BY taken_at DESC", account), -1)
    local installedApps = dbPoll(dbQuery(db, "SELECT app_id FROM installed_apps WHERE account=?", account), -1)
    local igProfiles = dbPoll(dbQuery(db, "SELECT * FROM instagram_profiles"), -1)
    local igPosts = dbPoll(dbQuery(db, "SELECT * FROM instagram_posts ORDER BY created_at DESC LIMIT 50"), -1)
    local shortsPosts = dbPoll(dbQuery(db, "SELECT * FROM shorts_posts ORDER BY created_at DESC LIMIT 50"), -1)
    local onionPosts = dbPoll(dbQuery(db, "SELECT * FROM onion_posts ORDER BY created_at DESC LIMIT 30"), -1)
    local mails = dbPoll(dbQuery(db, "SELECT * FROM mail WHERE receiver_number=? ORDER BY created_at DESC", (sim[1] and sim[1]["phone_number"]) or ""), -1)

    -- IG follows
    local following = dbPoll(dbQuery(db, "SELECT following_account FROM instagram_follows WHERE follower_account=?", account), -1)
    local followers = dbPoll(dbQuery(db, "SELECT follower_account FROM instagram_follows WHERE following_account=?", account), -1)
    local igLikes = dbPoll(dbQuery(db, "SELECT post_id FROM instagram_likes WHERE account=?", account), -1)
    local shortsLikes = dbPoll(dbQuery(db, "SELECT post_id FROM shorts_likes WHERE account=?", account), -1)
    local onionLikes = dbPoll(dbQuery(db, "SELECT post_id FROM onion_likes WHERE account=?", account), -1)

    local apps = {}
    if installedApps then
        for _, v in ipairs(installedApps) do
            table.insert(apps, v["app_id"])
        end
    end

    local followingList = {}
    if following then
        for _, v in ipairs(following) do
            table.insert(followingList, v["following_account"])
        end
    end

    local igLikesList = {}
    if igLikes then
        for _, v in ipairs(igLikes) do
            table.insert(igLikesList, tonumber(v["post_id"]))
        end
    end

    local shortsLikesList = {}
    if shortsLikes then
        for _, v in ipairs(shortsLikes) do
            table.insert(shortsLikesList, tonumber(v["post_id"]))
        end
    end

    local onionLikesList = {}
    if onionLikes then
        for _, v in ipairs(onionLikes) do
            table.insert(onionLikesList, tonumber(v["post_id"]))
        end
    end

    -- Check plan expiry
    local simActive = false
    local simPlanName = ""
    local dataPerDay = 0
    local maxCallsWeek = 0
    local callsRemaining = 0
    local dataUsed = 0
    local simExpiry = ""
    local phoneNumber = ""

    if sim and sim[1] then
        simActive = sim[1]["active"] == 1
        phoneNumber = sim[1]["phone_number"] or ""
        simPlanName = sim[1]["recharge_plan"] or ""
        simExpiry = sim[1]["recharge_expiry"] or ""
        dataUsed = tonumber(sim[1]["data_used"]) or 0
        callsRemaining = tonumber(sim[1]["calls_used"]) or 0

        if simExpiry ~= "" then
            local expiryTime = strtotime(simExpiry)
            if expiryTime and expiryTime < os.time() then
                simActive = false
                simPlanName = "Expired"
            end
        end

        -- Get plan details
        if simPlanName ~= "" and config.recharge_plans[string.lower(simPlanName)] then
            local plan = config.recharge_plans[string.lower(simPlanName)]
            dataPerDay = plan.data_per_day
            maxCallsWeek = plan.max_calls_week
            callsRemaining = math.max(0, maxCallsWeek - callsRemaining)
        end
    end

    -- Contacts
    local contactList = {}
    if contacts then
        for _, v in ipairs(contacts) do
            table.insert(contactList, {
                id = v["id"],
                name = v["name"],
                number = v["phone_number"],
                emergency = v["is_emergency"] == 1
            })
        end
    end

    -- Screenshots
    local screenshotList = {}
    if screenshots then
        for _, v in ipairs(screenshots) do
            table.insert(screenshotList, {
                id = v["id"],
                path = v["filename"]
            })
        end
    end

    -- Messages
    local messages = {}
    if phoneNumber ~= "" then
        local msgs = dbPoll(dbQuery(db, "SELECT * FROM messages WHERE (sender_number=? OR receiver_number=?) ORDER BY created_at ASC", phoneNumber, phoneNumber), -1)
        if msgs then
            for _, v in ipairs(msgs) do
                local otherNum = v["sender_number"] == phoneNumber and v["receiver_number"] or v["sender_number"]
                if not messages[otherNum] then messages[otherNum] = {} end
                table.insert(messages[otherNum], {
                    from = v["sender_number"] == phoneNumber and "me" or "other",
                    content = v["content"],
                    time = v["created_at"]
                })
            end
        end
    end

    -- Conversations
    local conversations = {}
    for num, msgs in pairs(messages) do
        local lastMsg = msgs[#msgs]
        table.insert(conversations, {
            number = num,
            name = num,
            last_message = lastMsg and lastMsg.content or "",
            unread = 0
        })
    end

    -- IG post comments count
    local igComments = {}
    for _, p in ipairs(igPosts) do
        local comments = dbPoll(dbQuery(db, "SELECT * FROM instagram_comments WHERE post_id=?", p["id"]), -1)
        igComments[tostring(p["id"])] = {}
        if comments then
            for _, cm in ipairs(comments) do
                table.insert(igComments[tostring(p["id"])], {
                    username = cm["username"],
                    content = cm["content"]
                })
            end
        end
    end

    -- IG follower/following counts
    local followersCount = {}
    local followingCount = {}
    for _, p in ipairs(igProfiles or {}) do
        local uname = p["username"]
        local fc = dbPoll(dbQuery(db, "SELECT COUNT(*) as cnt FROM instagram_follows WHERE following_account=?", uname), -1)
        local fgc = dbPoll(dbQuery(db, "SELECT COUNT(*) as cnt FROM instagram_follows WHERE follower_account=?", uname), -1)
        followersCount[uname] = (fc and fc[1] and tonumber(fc[1]["cnt"])) or 0
        followingCount[uname] = (fgc and fgc[1] and tonumber(fgc[1]["cnt"])) or 0
    end

    return {
        username = account,
        display_name = (phone[1] and phone[1]["display_name"]) or "Player",
        phone_number = phoneNumber,
        wallpaper_lock = (phone[1] and phone[1]["wallpaper_lock"]) or "default_lock",
        wallpaper_home = (phone[1] and phone[1]["wallpaper_home"]) or "default_home",
        ringtone = (phone[1] and phone[1]["ringtone"]) or "chamada_01",
        notification_sound = (phone[1] and phone[1]["notification_sound"]) or "notify_01",
        sim_active = simActive,
        sim_plan_name = simPlanName,
        sim_expiry = simExpiry,
        data_per_day = dataPerDay,
        data_used = dataUsed,
        max_calls_week = maxCallsWeek,
        calls_remaining = callsRemaining,
        has_phone = phone and #phone > 0,
        contacts = contactList,
        screenshots = screenshotList,
        conversations = conversations,
        messages = messages,
        mails = mails or {},
        installed_apps = apps,
        ig_posts = igPosts or {},
        ig_comments = igComments,
        ig_profiles = igProfiles or {},
        ig_likes = igLikesList,
        shorts_posts = shortsPosts or {},
        shorts_likes = shortsLikesList,
        onion_posts = onionPosts or {},
        onion_likes = onionLikesList,
        following = followingList,
        ig_followers_count = followersCount,
        ig_following_count = followingCount,
        unread_messages = 0,
        unread_mail = #mails,
    }
end

-- Request phone data
addEvent("Ophone.requestData", true)
addEventHandler("Ophone.requestData", root, function()
    local account = getPlayerAccountName(source)
    if not account then return end
    local hasPhone = inv:getItem(source, "Phone")
    local hasOPhone = inv:getItem(source, "OPhone")
    if (not hasPhone or hasPhone < 1) and (not hasOPhone or hasOPhone < 1) then
        outputChatBox("#ff453a[Ophone] #ffffffYou need a Phone!", source, 255, 255, 255, true)
        return
    end
    local data = getPlayerPhoneData(account)
    if data then
        triggerClientEvent(source, "Ophone.open", resourceRoot, data)
    end
end)

-- Shop system
addEvent("Ophone.buyPhone", true)
addEventHandler("Ophone.buyPhone", root, function()
    local account = getPlayerAccountName(source)
    if not account then return end
    local hasPhone = inv:getItem(source, "OPhone Box")
    if hasPhone and hasPhone >= 1 then
        outputChatBox("#ff9f0a[Ophone] #ffffffYou already have an OPhone Box!", source, 255, 255, 255, true)
        return
    end
    local money = getPlayerMoney(source)
    if money < config.shop_price_phone then
        outputChatBox("#ff453a[Ophone] #ffffffNot enough money! Need $" .. config.shop_price_phone, source, 255, 255, 255, true)
        return
    end
    takePlayerMoney(source, config.shop_price_phone)
    inv:giveItem(source, "OPhone Box", 1)
    outputChatBox("#30d158[Ophone] #ffffffBought an OPhone Box! Use it from inventory.", source, 255, 255, 255, true)
end)

addEvent("Ophone.buySim", true)
addEventHandler("Ophone.buySim", root, function()
    local account = getPlayerAccountName(source)
    if not account then return end
    local hasSim = inv:getItem(source, "OPhone Sim")
    if hasSim and hasSim >= 1 then
        outputChatBox("#ff9f0a[Ophone] #ffffffYou already have a Sim Card!", source, 255, 255, 255, true)
        return
    end
    local money = getPlayerMoney(source)
    if money < config.shop_price_sim then
        outputChatBox("#ff453a[Ophone] #ffffffNot enough money! Need $" .. config.shop_price_sim, source, 255, 255, 255, true)
        return
    end
    takePlayerMoney(source, config.shop_price_sim)
    inv:giveItem(source, "OPhone Sim", 1)
    outputChatBox("#30d158[Ophone] #ffffffBought a Sim Card! Use it while holding your phone.", source, 255, 255, 255, true)
end)

-- Activate SIM
addEvent("Ophone.activateSim", true)
addEventHandler("Ophone.activateSim", root, function()
    local account = getPlayerAccountName(source)
    if not account then return end
    local hasSim = inv:getItem(source, "OPhone Sim")
    if not hasSim or hasSim < 1 then
        outputChatBox("#ff453a[Ophone] #ffffffYou need a Sim Card!", source, 255, 255, 255, true)
        return
    end
    local existingSim = dbPoll(dbQuery(db, "SELECT * FROM sim_cards WHERE account=?", account), -1)
    if existingSim and #existingSim > 0 and existingSim[1]["active"] == 1 then
        outputChatBox("#ff9f0a[Ophone] #ffffffSIM already active!", source, 255, 255, 255, true)
        return
    end

    local phoneNumber = getNextPhoneIndex()
    inv:takeItem(source, "OPhone Sim", 1)

    -- Create phone if doesn't exist
    local existingPhone = dbPoll(dbQuery(db, "SELECT * FROM phones WHERE account=?", account), -1)
    if not existingPhone or #existingPhone == 0 then
        dbExec(db, "INSERT INTO phones (account, phone_number) VALUES (?, ?)", account, phoneNumber)
    end

    -- Create or update SIM
    if existingSim and #existingSim > 0 then
        dbExec(db, "UPDATE sim_cards SET phone_number=?, active=1, recharge_plan='Starter', recharge_expiry=datetime('now', '+7 days'), calls_used=0, data_used=0 WHERE account=?", phoneNumber, account)
    else
        dbExec(db, "INSERT INTO sim_cards (account, phone_number, active, recharge_plan, recharge_expiry) VALUES (?, ?, 1, 'Starter', datetime('now', '+7 days'))", account, phoneNumber)
    end

    outputChatBox("#30d158[Ophone] #ffffffSIM activated! Your number: " .. phoneNumber, source, 255, 255, 255, true)
    -- Refresh phone data
    local data = getPlayerPhoneData(account)
    if data then
        triggerClientEvent(source, "Ophone.updateData", resourceRoot, data)
    end
end)

-- Recharge plan
addEvent("Ophone.rechargePlan", true)
addEventHandler("Ophone.rechargePlan", root, function(planId)
    local account = getPlayerAccountName(source)
    if not account then return end
    local plan = config.recharge_plans[planId]
    if not plan then return end

    local money = getPlayerMoney(source)
    if money < plan.price then
        outputChatBox("#ff453a[Ophone] #ffffffNot enough money! Need $" .. plan.price, source, 255, 255, 255, true)
        return
    end

    takePlayerMoney(source, plan.price)
    dbExec(db, "UPDATE sim_cards SET recharge_plan=?, recharge_expiry=datetime('now', '+' || ? || ' days'), calls_used=0, data_used=0 WHERE account=?", plan.name, plan.duration_days, account)

    outputChatBox("#30d158[Ophone] #ffffff" .. plan.name .. " plan activated!", source, 255, 255, 255, true)
    local data = getPlayerPhoneData(account)
    if data then
        triggerClientEvent(source, "Ophone.updateData", resourceRoot, data)
    end
end)

-- Contacts
addEvent("Ophone.addContact", true)
addEventHandler("Ophone.addContact", root, function(name, number)
    local account = getPlayerAccountName(source)
    if not account or not name or not number then return end
    local emergency = false
    for _, v in ipairs(config.emergency_contacts) do
        if v.number == number then emergency = true break end
    end
    dbExec(db, "INSERT INTO contacts (account, name, phone_number, is_emergency) VALUES (?, ?, ?, ?)", account, name, number, emergency and 1 or 0)
    local data = getPlayerPhoneData(account)
    if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
end)

addEvent("Ophone.deleteContact", true)
addEventHandler("Ophone.deleteContact", root, function(id)
    local account = getPlayerAccountName(source)
    if not account then return end
    dbExec(db, "DELETE FROM contacts WHERE id=? AND account=?", id, account)
    local data = getPlayerPhoneData(account)
    if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
end)

-- Messages
addEvent("Ophone.sendMessage", true)
addEventHandler("Ophone.sendMessage", root, function(toNumber, content)
    local account = getPlayerAccountName(source)
    if not account or not toNumber or not content then return end
    local sim = dbPoll(dbQuery(db, "SELECT phone_number FROM sim_cards WHERE account=? AND active=1", account), -1)
    if not sim or #sim == 0 then return end
    local fromNumber = sim[1]["phone_number"]
    dbExec(db, "INSERT INTO messages (sender_number, receiver_number, content) VALUES (?, ?, ?)", fromNumber, toNumber, content)

    -- Notify receiver
    for _, player in ipairs(getElementsByType("player")) do
        local pAcc = getAccountName(player)
        if pAcc then
            local pSim = dbPoll(dbQuery(db, "SELECT phone_number FROM sim_cards WHERE account=? AND active=1", pAcc), -1)
            if pSim and #pSim > 0 and pSim[1]["phone_number"] == toNumber then
                triggerClientEvent(player, "Ophone.notify", resourceRoot, "New message from " .. fromNumber, "info")
            end
        end
    end
end)

-- Mail
addEvent("Ophone.sendMail", true)
addEventHandler("Ophone.sendMail", root, function(toNumber, subject, content)
    local account = getPlayerAccountName(source)
    if not account or not toNumber or not content then return end
    local sim = dbPoll(dbQuery(db, "SELECT phone_number FROM sim_cards WHERE account=? AND active=1", account), -1)
    if not sim or #sim == 0 then return end
    local fromNumber = sim[1]["phone_number"]
    local displayName = ""
    local phone = dbPoll(dbQuery(db, "SELECT display_name FROM phones WHERE account=?", account), -1)
    if phone and phone[1] then displayName = phone[1]["display_name"] or "" end
    dbExec(db, "INSERT INTO mail (sender_number, sender_name, receiver_number, subject, content) VALUES (?, ?, ?, ?, ?)", fromNumber, displayName, toNumber, subject or "", content)
end)

addEvent("Ophone.deleteMail", true)
addEventHandler("Ophone.deleteMail", root, function(id)
    local account = getPlayerAccountName(source)
    if not account then return end
    local sim = dbPoll(dbQuery(db, "SELECT phone_number FROM sim_cards WHERE account=? AND active=1", account), -1)
    if not sim or #sim == 0 then return end
    dbExec(db, "DELETE FROM mail WHERE id=? AND receiver_number=?", id, sim[1]["phone_number"])
end)

-- Instagram
addEvent("Ophone.igCreatePost", true)
addEventHandler("Ophone.igCreatePost", root, function(postType, mediaPath, mediaUrl, caption, bgColor)
    local account = getPlayerAccountName(source)
    if not account then return end
    local profile = dbPoll(dbQuery(db, "SELECT username FROM instagram_profiles WHERE account=?", account), -1)
    local username = (profile and profile[1] and profile[1]["username"]) or account

    if mediaUrl and mediaUrl ~= "" and (not mediaPath or mediaPath == "") then
        -- Fetch remote image
        fetchRemote(mediaUrl, function(data, status)
            if status == 0 then
                local filename = "screenshots/" .. account .. "_ig_" .. getTickCount() .. ".png"
                local file = fileCreate(filename)
                if file then
                    fileWrite(file, data)
                    fileClose(file)
                    dbExec(db, "INSERT INTO instagram_posts (account, username, post_type, media_path, caption, bg_color) VALUES (?, ?, ?, ?, ?, ?)", account, username, postType, filename, caption or "", bgColor or "")
                end
            end
        end)
    else
        dbExec(db, "INSERT INTO instagram_posts (account, username, post_type, media_path, caption, bg_color) VALUES (?, ?, ?, ?, ?, ?)", account, username, postType, mediaPath or "", caption or "", bgColor or "")
    end

    local data = getPlayerPhoneData(account)
    if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
end)

addEvent("Ophone.igLike", true)
addEventHandler("Ophone.igLike", root, function(postId)
    local account = getPlayerAccountName(source)
    if not account then return end
    local existing = dbPoll(dbQuery(db, "SELECT * FROM instagram_likes WHERE post_id=? AND account=?", postId, account), -1)
    if existing and #existing == 0 then
        dbExec(db, "INSERT INTO instagram_likes (post_id, account) VALUES (?, ?)", postId, account)
        dbExec(db, "UPDATE instagram_posts SET likes_count = likes_count + 1 WHERE id=?", postId)
    end
end)

addEvent("Ophone.igUnlike", true)
addEventHandler("Ophone.igUnlike", root, function(postId)
    local account = getPlayerAccountName(source)
    if not account then return end
    dbExec(db, "DELETE FROM instagram_likes WHERE post_id=? AND account=?", postId, account)
    dbExec(db, "UPDATE instagram_posts SET likes_count = MAX(0, likes_count - 1) WHERE id=?", postId)
end)

addEvent("Ophone.igDeletePost", true)
addEventHandler("Ophone.igDeletePost", root, function(postId)
    local account = getPlayerAccountName(source)
    if not account then return end
    dbExec(db, "DELETE FROM instagram_posts WHERE id=? AND account=?", postId, account)
    dbExec(db, "DELETE FROM instagram_comments WHERE post_id=?", postId)
    dbExec(db, "DELETE FROM instagram_likes WHERE post_id=?", postId)
end)

addEvent("Ophone.igComment", true)
addEventHandler("Ophone.igComment", root, function(postId, content)
    local account = getPlayerAccountName(source)
    if not account or not content then return end
    local profile = dbPoll(dbQuery(db, "SELECT username FROM instagram_profiles WHERE account=?", account), -1)
    local username = (profile and profile[1] and profile[1]["username"]) or account
    dbExec(db, "INSERT INTO instagram_comments (post_id, account, username, content) VALUES (?, ?, ?, ?)", postId, account, username, content)
    dbExec(db, "UPDATE instagram_posts SET comments_count = comments_count + 1 WHERE id=?", postId)
end)

addEvent("Ophone.igFollow", true)
addEventHandler("Ophone.igFollow", root, function(username)
    local account = getPlayerAccountName(source)
    if not account or not username then return end
    local existing = dbPoll(dbQuery(db, "SELECT * FROM instagram_follows WHERE follower_account=? AND following_account=?", account, username), -1)
    if existing and #existing == 0 then
        dbExec(db, "INSERT INTO instagram_follows (follower_account, following_account) VALUES (?, ?)", account, username)
    end
end)

addEvent("Ophone.igUnfollow", true)
addEventHandler("Ophone.igUnfollow", root, function(username)
    local account = getPlayerAccountName(source)
    if not account then return end
    dbExec(db, "DELETE FROM instagram_follows WHERE follower_account=? AND following_account=?", account, username)
end)

addEvent("Ophone.igUpdateProfile", true)
addEventHandler("Ophone.igUpdateProfile", root, function(username, displayName, bio)
    local account = getPlayerAccountName(source)
    if not account then return end
    local existing = dbPoll(dbQuery(db, "SELECT * FROM instagram_profiles WHERE account=?", account), -1)
    if existing and #existing > 0 then
        dbExec(db, "UPDATE instagram_profiles SET username=?, display_name=?, bio=? WHERE account=?", username, displayName, bio, account)
    else
        dbExec(db, "INSERT INTO instagram_profiles (account, username, display_name, bio) VALUES (?, ?, ?, ?)", account, username, displayName, bio)
    end
end)

-- Shorts
addEvent("Ophone.shortsCreatePost", true)
addEventHandler("Ophone.shortsCreatePost", root, function(postType, mediaPath, mediaUrl, caption, bgColor, bgGradient, fontStyle)
    local account = getPlayerAccountName(source)
    if not account then return end
    local profile = dbPoll(dbQuery(db, "SELECT username FROM instagram_profiles WHERE account=?", account), -1)
    local username = (profile and profile[1] and profile[1]["username"]) or account

    if mediaUrl and mediaUrl ~= "" and (not mediaPath or mediaPath == "") then
        fetchRemote(mediaUrl, function(data, status)
            if status == 0 then
                local filename = "screenshots/" .. account .. "_shorts_" .. getTickCount() .. ".png"
                local file = fileCreate(filename)
                if file then
                    fileWrite(file, data)
                    fileClose(file)
                    dbExec(db, "INSERT INTO shorts_posts (account, username, post_type, media_path, caption, bg_color, bg_gradient, font_style) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", account, username, postType, filename, caption or "", bgColor or "", bgGradient or "", fontStyle or "")
                end
            end
        end)
    else
        dbExec(db, "INSERT INTO shorts_posts (account, username, post_type, media_path, caption, bg_color, bg_gradient, font_style) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", account, username, postType, mediaPath or "", caption or "", bgColor or "", bgGradient or "", fontStyle or "")
    end

    local data = getPlayerPhoneData(account)
    if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
end)

addEvent("Ophone.shortsLike", true)
addEventHandler("Ophone.shortsLike", root, function(postId)
    local account = getPlayerAccountName(source)
    if not account then return end
    local existing = dbPoll(dbQuery(db, "SELECT * FROM shorts_likes WHERE post_id=? AND account=?", postId, account), -1)
    if existing and #existing == 0 then
        dbExec(db, "INSERT INTO shorts_likes (post_id, account) VALUES (?, ?)", postId, account)
        dbExec(db, "UPDATE shorts_posts SET likes_count = likes_count + 1 WHERE id=?", postId)
    end
end)

addEvent("Ophone.shortsUnlike", true)
addEventHandler("Ophone.shortsUnlike", root, function(postId)
    local account = getPlayerAccountName(source)
    if not account then return end
    dbExec(db, "DELETE FROM shorts_likes WHERE post_id=? AND account=?", postId, account)
    dbExec(db, "UPDATE shorts_posts SET likes_count = MAX(0, likes_count - 1) WHERE id=?", postId)
end)

-- Onion
addEvent("Ophone.onionPost", true)
addEventHandler("Ophone.onionPost", root, function(content)
    local account = getPlayerAccountName(source)
    if not account or not content then return end
    dbExec(db, "INSERT INTO onion_posts (content, account) VALUES (?, ?)", content, account)
    local data = getPlayerPhoneData(account)
    if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
end)

addEvent("Ophone.onionLike", true)
addEventHandler("Ophone.onionLike", root, function(postId)
    local account = getPlayerAccountName(source)
    if not account then return end
    local existing = dbPoll(dbQuery(db, "SELECT * FROM onion_likes WHERE post_id=? AND account=?", postId, account), -1)
    if existing and #existing == 0 then
        dbExec(db, "INSERT INTO onion_likes (post_id, account) VALUES (?, ?)", postId, account)
        dbExec(db, "UPDATE onion_posts SET likes = likes + 1 WHERE id=?", postId)
    else
        dbExec(db, "DELETE FROM onion_likes WHERE post_id=? AND account=?", postId, account)
        dbExec(db, "UPDATE onion_posts SET likes = MAX(0, likes - 1) WHERE id=?", postId)
    end
end)

-- App Store
addEvent("Ophone.installApp", true)
addEventHandler("Ophone.installApp", root, function(appId)
    local account = getPlayerAccountName(source)
    if not account then return end
    local existing = dbPoll(dbQuery(db, "SELECT * FROM installed_apps WHERE account=? AND app_id=?", account, appId), -1)
    if existing and #existing == 0 then
        dbExec(db, "INSERT INTO installed_apps (account, app_id) VALUES (?, ?)", account, appId)
    end
    local data = getPlayerPhoneData(account)
    if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
end)

-- Settings
addEvent("Ophone.setWallpaper", true)
addEventHandler("Ophone.setWallpaper", root, function(wallType, path)
    local account = getPlayerAccountName(source)
    if not account then return end
    if wallType == "lock" then
        dbExec(db, "UPDATE phones SET wallpaper_lock=? WHERE account=?", path, account)
    elseif wallType == "home" then
        dbExec(db, "UPDATE phones SET wallpaper_home=? WHERE account=?", path, account)
    elseif wallType == "both" then
        dbExec(db, "UPDATE phones SET wallpaper_lock=?, wallpaper_home=? WHERE account=?", path, path, account)
    end
    local data = getPlayerPhoneData(account)
    if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
end)

addEvent("Ophone.setWallpaperUrl", true)
addEventHandler("Ophone.setWallpaperUrl", root, function(wallType, url)
    local account = getPlayerAccountName(source)
    if not account then return end
    if wallType == "lock" then
        dbExec(db, "UPDATE phones SET wallpaper_lock=? WHERE account=?", url, account)
    elseif wallType == "home" then
        dbExec(db, "UPDATE phones SET wallpaper_home=? WHERE account=?", url, account)
    end
    local data = getPlayerPhoneData(account)
    if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
end)

addEvent("Ophone.setRingtone", true)
addEventHandler("Ophone.setRingtone", root, function(ringtone)
    local account = getPlayerAccountName(source)
    if not account then return end
    dbExec(db, "UPDATE phones SET ringtone=? WHERE account=?", ringtone, account)
end)

addEvent("Ophone.setNotificationSound", true)
addEventHandler("Ophone.setNotificationSound", root, function(sound)
    local account = getPlayerAccountName(source)
    if not account then return end
    dbExec(db, "UPDATE phones SET notification_sound=? WHERE account=?", sound, account)
end)

addEvent("Ophone.setDisplayName", true)
addEventHandler("Ophone.setDisplayName", root, function(name)
    local account = getPlayerAccountName(source)
    if not account or not name then return end
    dbExec(db, "UPDATE phones SET display_name=? WHERE account=?", name, account)
end)

addEvent("Ophone.factoryReset", true)
addEventHandler("Ophone.factoryReset", root, function()
    local account = getPlayerAccountName(source)
    if not account then return end
    dbExec(db, "DELETE FROM contacts WHERE account=?", account)
    dbExec(db, "DELETE FROM installed_apps WHERE account=?", account)
    dbExec(db, "UPDATE phones SET wallpaper_lock='default_lock', wallpaper_home='default_home', ringtone='chamada_01', notification_sound='notify_01' WHERE account=?", account)
    local data = getPlayerPhoneData(account)
    if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
end)

-- Screenshot callback
addEventHandler("onPlayerScreenShot", root, function(status, timestamp, info)
    if status == "ok" then
        local account = getPlayerAccountName(source)
        if not account then return end
        local filename = "screenshots/" .. account .. "_" .. timestamp .. ".png"
        dbExec(db, "INSERT INTO screenshots (account, filename) VALUES (?, ?)", account, filename)
        triggerClientEvent(source, "Ophone.screenshotTaken", resourceRoot, filename)
        local data = getPlayerPhoneData(account)
        if data then triggerClientEvent(source, "Ophone.updateData", resourceRoot, data) end
    end
end)

-- Phone 3D model animation
addEvent("Ophone.setAnimationPhone", true)
addEventHandler("Ophone.setAnimationPhone", root, function(mode)
    -- mode 1 = equip, mode 2 = unequip
    if mode == 1 then
        setPedAnimation(source, "PHONE", "phone_in", -1, false, false, false, true)
    else
        setPedAnimation(source, "PHONE", "phone_out", -1, false, false, false, true)
    end
end)

-- Shop markers
addEventHandler("onResourceStart", resourceRoot, function()
    for _, loc in ipairs(config.shop_locations) do
        local marker = createMarker(loc.x, loc.y, loc.z - 1, "cylinder", 1.5, 0, 200, 255, 100)
        local blip = createBlip(loc.x, loc.y, loc.z, config.shop_blip)
        addEventHandler("onMarkerHit", marker, function(hitElement, matchingDimension)
            if getElementType(hitElement) == "player" and matchingDimension then
                triggerClientEvent(hitElement, "Ophone.showShop", resourceRoot)
            end
        end)
    end
end)
