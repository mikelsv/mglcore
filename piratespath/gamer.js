// Gamer JS - load, store, save game values.

// Set your name
gamer.projectName = "pirates_path";

// And versions
gamer.projectVers = [ // New to up
    ["1.9", "11.05.2025 15:56", "Yandex bug fixes IV."],
    ["1.8", "08.05.2025 02:34", "Relocate and make mglcore."],
    ["1.7", "07.05.2025 15:49", "Yandex bug fixes III."],
    ["1.6", "07.05.2025 12:27", "Yandex bug fixes II."],
    ["1.5", "04.05.2025 21:19", "Yandex bug fixes."],
    ["1.4", "04.05.2025 20:17", "Reward options."],
    ["1.3", "04.05.2025 19:18", "Sound options. Level generators."],
    ["1.2", "03.05.2025 16:25", "Make jump hero"],
    ["1.1", "03.05.2025 13:05", "Release build"],
    ["1.0", "17.04.2025 5:21", "Final build"],
    ["0.1", "02.04.2025 15:21", "Make project and main code"],
];

// Base
gamer.base = {
    // Lang
    lang: "en",

    // Base values
    power_level: 1,
    range_level: 1,
    rate_level: 1,
    shot_speed: 15,

    // Level
    level: 1,
    level_max: 1,

//        health_max: 5,
    vspeed: 1,
    hspeed: 10,
//        range: 5,

    coins: 0,
    coins_collect: 0,

    // Options
    opt_sound: 1,
    opt_music: 1,

    update(){
        this.coins_collect = 0;
        this.power = this.power_level;
        this.range = this.range_level * 2 + 10;
        this.rate = this.rate_level + 1;
    }
};

// Langs
gamer.langs = {
    "LOADING_MESSAGE": {
        en: "Loading:",
        ru: "Загрузка:"
    },
    "MENU_START":{
        en: "Start!",
        ru: "Вперёд!"
    },
    "MENU_RESTART":{
        en: "Restart",
        ru: "Начать с начала"
    },
    "MENU_NEXT":{
        en: "Next level",
        ru: "Дальше"
    },
    "MENU_SHOP":{
        en: "Exit to menu",
        ru: "Выйти в меню"
    },
    "MENU_LEVELS":{
        en: "Select level",
        ru: "Выбор уровня"
    },
    "MENU_ENDLESS":{
        en: "To infinity and beyond!",
        ru: "Бесконечность не предел!"
    },
    "TEXT_POWER":{
        en: "POWER",
        ru: "СИЛА"
    },
    "TEXT_RATE":{
        en: "RATE",
        ru: "СКОРОСТЬ"
    },
    "TEXT_RANGE":{
        en: "RANGE",
        ru: "ДАЛЬНОСТЬ"
    },
    LEVEL_TEXT: {
        en: "Level",
        ru: "Уровень"
    },
    LEVEL_RUN: {
        en: "Run!",
        ru: "Поплыли!"
    },
    "BONUS_GET":{
        en: "Get a bonus for viewing ads",
        ru: "Получить бонус за рекламу"
    },
    "BONUS_NOTH":{
        en: "No thanks",
        ru: "Нет, спасибо"
    },
    MENU_SETTINGS: {
        en: "Settings",
        ru: "Настройки"
    },
    MENU_SOUND: {
        en: "Sound",
        ru: "Звук"
    },
    MENU_MUSIC: {
        en: "Music",
        ru: "Музыка"
    },
    MENU_SOUND_ON: {
        en: "On",
        ru: "Да"
    },
    MENU_SOUND_OFF: {
        en: "Off",
        ru: "Нет"
    },
    MENU_BACK: {
        en: "Back",
        ru: "Назад"
    },
    DEVELOPER_MESSAGE:{
        en: `The game is in development.
Leave your feedback to
make the game better!`,
        ru: `Игра в разработке.
Оставляйте свои отзывы,
чтобы сделать игру лучше!`
    },

    GAMER_TITLE: {
        en: `The Pirate's Way`,
        ru: `Путь пирата`
    },

    GAMER_DESCR: {
        en: `The Pirate's Way is an arcade game where you take on the role of a captain of a pirate ship. Your goal is to collect as many gold coins as possible by breaking barrels and avoiding dangers.
<p>
Controls:<br>
Use the arrow keys or WASD to control the movement of your ship.<br>
You can also control the ship with the mouse, moving the cursor in the desired direction.
        `,
        ru: `Путь пирата — это аркадная игра, в которой вы берете на себя роль капитана пиратского корабля. Ваша цель — собрать как можно больше золотых монет, разбивая бочки и избегая опасностей.
<p>
Управление:<br>
* Используйте клавиши стрелок или WASD для управления движением вашего корабля.<br>
* Вы также можете управлять кораблем с помощью мыши, перемещая курсор в нужном направлении.
        `
    }
};

