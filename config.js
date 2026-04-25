// Конфигурация проекта MineLacs
const CONFIG = {
    // Ссылки на скачивание
    downloads: {
        onelauncher: 'https://github.com/OneLacs-Project/minelacs-launcher/releases/download/v1.3.1/OneLauncher-Setup-1.3.1.exe',
        onelauncherAvailable: false,
        modpack: {
            zip: 'https://github.com/OneLacs-Project/minelacspages/releases/download/minelacscreateaero/MineLacs-Create.Aero.zip',
            mrpack: 'https://github.com/OneLacs-Project/minelacspages/releases/download/minelacscreateaero/MineLacs-Create.Aero.mrpack'
        },
        mirrors: {
            zip: 'https://t.me/minelacs/718',
            mrpack: 'https://t.me/minelacs/718'
        }
    },

    // Социальные сети
    social: {
        discord: 'http://dsc.gg/minelacs',
        telegram: 'http://t.me/minelacs',
        youtube: 'https://www.youtube.com/@MineLacs',
        boosty: 'https://boosty.to/MineLacs',
        shop: 'https://shop.minelacs.fun/',
        wiki: 'https://wiki.minelacs.fun/'
    },

    // Сервер
    server: {
        ip: 'go.minelacs.fun',
        statusApi: 'https://api.mcsrvstat.us/3/'
    },

    // Версии
    version: {
        minecraft: '1.21.1',
        modpack: '1.0',
        onelauncher: '1.0.0'
    },

    // Информация о текущем сезоне
    season: {
        name: 'MineLacs Create&Aero',
        description: 'Вперёд и вверх!',
        logo: 'images/title.png'
    },

    // Размеры файлов
    fileSize: {
        zip: '325 МБ',
        mrpack: '1.48 МБ'
    },

    // Команда разработчиков
    team: [
        {
            nickname: 'SawaDawa177_',
            role: 'Создатель Проекта, Разработчик Сервера',
            namemc: 'https://namemc.com/profile/SawaDawa177_',
            github: 'https://github.com/notsawadawa177',
            head: 'https://mc-heads.net/head/SawaDawa177_/128'
        },
        {
            nickname: 'GreatShow6102',
            role: 'Редактор Вики, Администратор Дискорд Сервера',
            namemc: 'https://namemc.com/profile/GreatShow6102',
            github: 'https://github.com/VGSS6102',
            head: 'https://mc-heads.net/head/GreatShow6102/128'
        }
    ],

    // Ссылки на инструкции
    instructions: {
        modrinthApp: 'https://git.astralium.su/didirus/AstralRinth/releases/download/AR-0.10.601/AstralRinth%20App_0.10.601_x64-setup.exe'
    }
};
