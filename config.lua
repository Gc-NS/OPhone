config = {
    bind = "-",

    -- Shop
    shop_price_phone = 5000,
    shop_price_sim = 2000,
    shop_locations = {
        {x = 1170.66, y = -1489.66, z = 22.75},
    },
    shop_blip = 47,

    -- SIM Recharge Plans
    recharge_plans = {
        starter = {
            name = "Starter",
            price = 0,
            data_per_day = 1.0,
            max_calls_week = 500,
            duration_days = 7,
            description = "1GB/day, 500 calls/week, 7 days",
        },
        basic = {
            name = "Basic",
            price = 500,
            data_per_day = 2.0,
            max_calls_week = 1000,
            duration_days = 7,
            description = "2GB/day, 1000 calls/week, 7 days",
        },
        premium = {
            name = "Premium",
            price = 1500,
            data_per_day = 5.0,
            max_calls_week = -1,
            duration_days = 30,
            description = "5GB/day, Unlimited calls, 30 days",
        },
        ultimate = {
            name = "Ultimate",
            price = 3000,
            data_per_day = -1,
            max_calls_week = -1,
            duration_days = 30,
            description = "Unlimited data & calls, 30 days",
        },
    },

    -- Battery
    battery_drain_open = 0.05,
    battery_drain_call = 0.2,
    battery_drain_idle = 0.01,
    charger_spots = {
        {x = 1170.66, y = -1489.66, z = 22.75, radius = 3.0},
    },
    charger_recharge_rate = 1.0,

    -- Towers
    towers = {
        {x = 1170.66, y = -1489.66, z = 22.75, radius = 500.0, strength = 100},
        {x = 1500.0, y = -1600.0, z = 20.0, radius = 400.0, strength = 100},
        {x = 1200.0, y = -1200.0, z = 15.0, radius = 600.0, strength = 100},
    },

    -- Camera (portrait format)
    screenshot_quality = 80,
    screenshot_width = 480,
    screenshot_height = 640,
    max_screenshots = 50,

    -- Social
    max_caption_length = 500,
    max_comments_display = 20,
    posts_per_page = 15,
    max_bio_length = 150,
    shorts_max_caption = 300,
    shorts_text_max_chars = 200,
    onion_post_expiry_hours = 24,

    -- Emergency
    emergency_contacts = {
        {name = "SAMU", number = "192"},
        {name = "Police", number = "190"},
        {name = "Mechanic", number = "185"},
        {name = "Staff", number = "000"},
    },

    acl_emergency = {
        ["SAMU"] = "EmsDuty",
        ["Police"] = "PoliceDuty",
        ["Mechanic"] = "MechDuty",
        ["Staff"] = "TaxiDuty",
    },

    -- App Store
    store_apps = {
        {id = "instagram", name = "Instagram", icon = "instagram", price = 0, description = "Photo sharing & social network"},
        {id = "shorts", name = "Shorts", icon = "shorts", price = 0, description = "Short-form video content"},
        {id = "onion", name = "Onion Browser", icon = "onion", price = 0, description = "Anonymous dark web browser"},
        {id = "mail", name = "Mail", icon = "mail", price = 0, description = "Email messaging"},
    },

    discord_webhook = "",
}
