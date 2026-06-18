# ═══════════════════════════════════════════════════════════
# Заполнение БД данными
# Запуск: python seed_data.py
# ═══════════════════════════════════════════════════════════

import sqlite3
import json

DATABASE = 'cosmos.db'

# ═══ СОЛНЦЕ ═══
SUN = {
    'name': 'Солнце', 'emoji': '☀',
    'description': 'Жёлтый карлик класса G2V в центре нашей Солнечной системы. Занимает 99.86% массы всей системы и является источником энергии для всех планет.',
    'fact': 'Солнце превращает 600 миллионов тонн водорода в гелий каждую секунду. Температура ядра достигает 15 миллионов градусов Цельсия.',
    'diameter': '1 392 000 км', 'mass': '1.989 × 10³⁰ кг',
    'temp': '5 500°C поверхность / 15 000 000°C ядро',
    'type': 'Жёлтый карлик (G2V)', 'age': '4.6 млрд лет',
    'composition': '73% водород, 25% гелий, 2% другие элементы',
    'core': 'Термоядерный синтез: H → He',
    'img': 'images/sun.png'
}

# ═══ ПЛАНЕТЫ (с 3D-параметрами и текстурами) ═══
PLANETS = [
    {'name': 'Меркурий', 'emoji': '☿', 'color': '#B8A98E', 'glow': '#8C7B63',
     'tag': 'Каменная', 'tagColor': '#8C7B63',
     'dist': 110, 'radius': 4, 'speed': 4.7,
     'tilt': 0.03, 'gravity': 3.7, 'hasRing': False,
     'description': 'Ближайшая к Солнцу планета. Покрыта кратерами, похожа на Луну. Почти нет атмосферы.',
     'diameter': '4 879 км', 'dayLen': '59 земных дней', 'year': '88 дней',
     'distance': '57.9 млн км', 'mass': '3.3 × 10²³ кг', 'moons': '0',
     'fact': 'На Меркурии год короче суток. Температура днём +430°C, ночью -180°C.',
     'img': 'images/mercury.png',
     'p3d_radius': 0.9, 'p3d_hasRings': 0, 'p3d_moonCount': 0,
     'p3d_emissive': '', 'p3d_emissiveIntensity': 0, 'p3d_type': 'Каменная',
     'p3d_texture': 'images/textures/mercury_texture.png'},
    {'name': 'Венера', 'emoji': '♀', 'color': '#E5AC52', 'glow': '#C98F3C',
     'tag': 'Каменная', 'tagColor': '#C98F3C',
     'dist': 170, 'radius': 7, 'speed': 3.5,
     'tilt': 177, 'gravity': 8.87, 'hasRing': False,
     'description': 'Самая горячая планета Солнечной системы из-за парникового эффекта. Покрыта плотными облаками серной кислоты.',
     'diameter': '12 104 км', 'dayLen': '243 земных дня', 'year': '225 дней',
     'distance': '108.2 млн км', 'mass': '4.87 × 10²⁴ кг', 'moons': '0',
     'fact': 'На Венере сутки длиннее года. Вращается в обратную сторону относительно других планет.',
     'img': 'images/venus.png',
     'p3d_radius': 1.5, 'p3d_hasRings': 0, 'p3d_moonCount': 0,
     'p3d_emissive': '', 'p3d_emissiveIntensity': 0, 'p3d_type': 'Каменная',
     'p3d_texture': 'images/textures/venus_texture.png'},
    {'name': 'Земля', 'emoji': '🌍', 'color': '#6E7FA3', 'glow': '#4A5A7C',
     'tag': 'Обитаемая', 'tagColor': '#4A5A7C',
     'dist': 240, 'radius': 7, 'speed': 2.98,
     'tilt': 23.5, 'gravity': 9.81, 'hasRing': False,
     'description': 'Наш дом — единственная известная обитаемая планета. 71% поверхности покрыто водой.',
     'diameter': '12 742 км', 'dayLen': '24 часа', 'year': '365.25 дней',
     'distance': '149.6 млн км', 'mass': '5.97 × 10²⁴ кг', 'moons': '1',
     'fact': 'Вода существует на Земле в трёх состояниях одновременно. Единственная планета с жизнью.',
     'img': 'images/earth.png',
     'p3d_radius': 1.5, 'p3d_hasRings': 0, 'p3d_moonCount': 1,
     'p3d_emissive': '', 'p3d_emissiveIntensity': 0, 'p3d_type': 'Обитаемая',
     'p3d_texture': 'images/textures/earth_texture.png'},
    {'name': 'Марс', 'emoji': '♂', 'color': '#C97B5A', 'glow': '#A35840',
     'tag': 'Красная', 'tagColor': '#A35840',
     'dist': 320, 'radius': 5, 'speed': 2.41,
     'tilt': 25, 'gravity': 3.71, 'hasRing': False,
     'description': 'Красная планета с гигантскими вулканами и каньонами. Имеет самый высокий вулкан в Солнечной системе — Олимп (22 км).',
     'diameter': '6 779 км', 'dayLen': '24 ч 37 мин', 'year': '687 дней',
     'distance': '227.9 млн км', 'mass': '6.42 × 10²³ кг', 'moons': '2',
     'fact': 'Каньон Маринера длиной 4 000 км — самый большой каньон в Солнечной системе.',
     'img': 'images/mars.png',
     'p3d_radius': 1.0, 'p3d_hasRings': 0, 'p3d_moonCount': 2,
     'p3d_emissive': '', 'p3d_emissiveIntensity': 0, 'p3d_type': 'Каменная',
     'p3d_texture': 'images/textures/mars_texture.png'},
    {'name': 'Юпитер', 'emoji': '♃', 'color': '#DEC18C', 'glow': '#BFA06A',
     'tag': 'Газовый гигант', 'tagColor': '#BFA06A',
     'dist': 450, 'radius': 22, 'speed': 1.31,
     'tilt': 3, 'gravity': 24.79, 'hasRing': True,
     'description': 'Крупнейшая планета Солнечной системы — газовый гигант. Имеет Большое Красное Пятно — шторм, длящийся 350+ лет.',
     'diameter': '139 820 км', 'dayLen': '9 ч 56 мин', 'year': '11.86 лет',
     'distance': '778.5 млн км', 'mass': '1.90 × 10²⁷ кг', 'moons': '95',
     'fact': 'Земля поместилась бы внутри Юпитера 1 321 раз. Имеет 95 известных спутников.',
     'img': 'images/jupiter.png',
     'p3d_radius': 3.0, 'p3d_hasRings': 1, 'p3d_moonCount': 4,
     'p3d_emissive': '', 'p3d_emissiveIntensity': 0, 'p3d_type': 'Газовый гигант',
     'p3d_texture': 'images/textures/jupiter_texture.png'},
    {'name': 'Сатурн', 'emoji': '♄', 'color': '#E5D4A1', 'glow': '#C9B57E',
     'tag': 'С кольцами', 'tagColor': '#C9B57E',
     'dist': 580, 'radius': 18, 'speed': 0.97,
     'tilt': 27, 'gravity': 10.44, 'hasRing': True,
     'description': 'Знаменит своими великолепными кольцами из льда и камней. Вторая по размеру планета.',
     'diameter': '116 460 км', 'dayLen': '10 ч 42 мин', 'year': '29.46 лет',
     'distance': '1.43 млрд км', 'mass': '5.68 × 10²⁶ кг', 'moons': '146',
     'fact': 'Кольца простираются на 282 000 км, но их толщина всего 100 метров!',
     'img': 'images/saturn.png',
     'p3d_radius': 2.7, 'p3d_hasRings': 1, 'p3d_moonCount': 5,
     'p3d_emissive': '', 'p3d_emissiveIntensity': 0, 'p3d_type': 'Газовый гигант',
     'p3d_texture': 'images/textures/saturn_texture.png'},
    {'name': 'Уран', 'emoji': '♅', 'color': '#9FB8C9', 'glow': '#7393A8',
     'tag': 'Ледяной гигант', 'tagColor': '#7393A8',
     'dist': 700, 'radius': 11, 'speed': 0.68,
     'tilt': 98, 'gravity': 8.69, 'hasRing': False,
     'description': 'Ледяной гигант, вращается "лёжа на боку" с наклоном оси 98°. Самая холодная атмосфера в Солнечной системе.',
     'diameter': '50 724 км', 'dayLen': '17 ч 14 мин', 'year': '84 года',
     'distance': '2.87 млрд км', 'mass': '8.68 × 10²⁵ кг', 'moons': '27',
     'fact': 'Магнитная ось Урана смещена на 59° от оси вращения — уникально для планет.',
     'img': 'images/uranus.png',
     'p3d_radius': 2.0, 'p3d_hasRings': 1, 'p3d_moonCount': 3,
     'p3d_emissive': '', 'p3d_emissiveIntensity': 0, 'p3d_type': 'Ледяной гигант',
     'p3d_texture': 'images/textures/uranus_texture.png'},
    {'name': 'Нептун', 'emoji': '♆', 'color': '#7B89B5', 'glow': '#5A6896',
     'tag': 'Ледяной гигант', 'tagColor': '#5A6896',
     'dist': 820, 'radius': 10, 'speed': 0.54,
     'tilt': 28, 'gravity': 11.15, 'hasRing': False,
     'description': 'Самая далёкая планета от Солнца. Сильнейшие ветры в Солнечной системе — до 2 100 км/ч.',
     'diameter': '49 244 км', 'dayLen': '16 ч 6 мин', 'year': '164.8 лет',
     'distance': '4.50 млрд км', 'mass': '1.02 × 10²⁶ кг', 'moons': '16',
     'fact': 'Излучает в 2.6 раза больше тепла, чем получает от Солнца. Загадка для учёных!',
     'img': 'images/neptune.png',
     'p3d_radius': 1.95, 'p3d_hasRings': 0, 'p3d_moonCount': 2,
     'p3d_emissive': '', 'p3d_emissiveIntensity': 0, 'p3d_type': 'Ледяной гигант',
     'p3d_texture': 'images/textures/neptune_texture.png'}
]

# ═══ СПУТНИКИ
SATELLITES = [
    {'name': 'МКС', 'fullName': 'Международная космическая станция', 'emoji': '🛰',
     'owner': 'Международный проект',
     'description': 'Крупнейшая искусственная станция на орбите Земли. Постоянно обитаема с 2000 года.',
     'orbit': '~400 км', 'period': '~92.7 мин', 'launched': '1998', 'speed': '~7.66 км/с',
     'orbitType': 'earth', 'orbitRadius': 80, 'orbitSpeed': 0.025, 'satSize': 5,
     'img': 'images/satellites/iss.png', 'diameter': '~109 м', 'distance': '~400 км', 'mass': '~420 т',
     'color': '#4FC3F7'},
    {'name': 'Хаббл', 'fullName': 'Космический телескоп Hubble', 'emoji': '🔭',
     'owner': 'NASA / ESA',
     'description': 'Космический телескоп, работающий с 1990 года. Сделал более 1.5 миллиона наблюдений.',
     'orbit': '~540 км', 'period': '~95 мин', 'launched': '1990', 'speed': '~7.5 км/с',
     'orbitType': 'earth', 'orbitRadius': 110, 'orbitSpeed': 0.020, 'satSize': 4,
     'img': 'images/satellites/hubble.png', 'diameter': '13.1 м', 'distance': '~540 км', 'mass': '11.1 т',
     'color': '#BA68C8'},
    {'name': 'Джеймс Уэбб', 'fullName': 'James Webb Space Telescope', 'emoji': '🌌',
     'owner': 'NASA / ESA / CSA',
     'description': 'Самый мощный инфракрасный телескоп. Видит галактики на расстоянии 13.4 млрд световых лет.',
     'orbit': '~1.5 млн км (точка L2)', 'period': '~6 месяцев', 'launched': '2021', 'speed': '~1 км/с',
     'orbitType': 'sun', 'orbitRadius': 230, 'orbitSpeed': 0.008, 'satSize': 4,
     'img': 'images/satellites/webb.png', 'diameter': '6.5 м (зеркало)', 'distance': '1.5 млн км', 'mass': '6.2 т',
     'color': '#FFB74D'},
    {'name': 'GPS', 'fullName': 'Глобальная навигационная система', 'emoji': '📡',
     'owner': 'США (правительство)',
     'description': 'Группировка из более 30 спутников для навигации. Точность до 1 метра.',
     'orbit': '~20 200 км', 'period': '~12 часов', 'launched': 'с 1978', 'speed': '~3.9 км/с',
     'orbitType': 'earth', 'orbitRadius': 170, 'orbitSpeed': 0.006, 'satSize': 3,
     'img': 'images/satellites/gps.png', 'diameter': '~2 м', 'distance': '~20 200 км', 'mass': '~1.6 т',
     'color': '#81C784'},
    {'name': 'Starlink', 'fullName': 'Спутниковая группировка SpaceX', 'emoji': '🌐',
     'owner': 'SpaceX',
     'description': 'Сеть из тысяч малых спутников для обеспечения интернета по всей планете.',
     'orbit': '~550 км', 'period': '~95 мин', 'launched': 'с 2019', 'speed': '~7.6 км/с',
     'orbitType': 'earth', 'orbitRadius': 95, 'orbitSpeed': 0.022, 'satSize': 2.5,
     'img': 'images/satellites/starlink.png', 'diameter': '~2.8 м', 'distance': '~550 км', 'mass': '~260 кг',
     'color': '#E57373'},
    {'name': 'Voyager 1', 'fullName': 'Межзвёздный зонд', 'emoji': '🚀',
     'owner': 'NASA',
     'description': 'Самый удалённый рукотворный объект. Покинул Солнечную систему в 2012 году.',
     'orbit': '>24 млрд км от Солнца', 'period': '—', 'launched': '1977', 'speed': '~17 км/с',
     'orbitType': 'deep', 'orbitRadius': 280, 'orbitSpeed': 0.003, 'satSize': 4,
     'img': 'images/satellites/voyager.png', 'diameter': '~13 м (с антенной)', 'distance': '24 млрд км', 'mass': '722 кг',
     'color': '#64B5F6'},
    {'name': 'Луна', 'fullName': 'Естественный спутник Земли', 'emoji': '🌙',
     'owner': 'Природа',
     'description': 'Естественный спутник Земли. Единственное небесное тело, кроме Земли, на котором побывал человек. Влияет на приливы и отливы.',
     'orbit': '~384 400 км', 'period': '27.3 дня', 'launched': '4.5 млрд лет назад', 'speed': '~1 км/с',
     'orbitType': 'earth', 'orbitRadius': 200, 'orbitSpeed': 0.004, 'satSize': 6,
     'img': 'images/satellites/moon.png', 'diameter': '3 475 км', 'distance': '384 400 км', 'mass': '7.35 × 10²² кг',
     'color': '#F5F5F5'},
    {'name': 'Europa Clipper', 'fullName': 'Миссия к спутнику Юпитера', 'emoji': '🧊',
     'owner': 'NASA',
     'description': 'Миссия к спутнику Юпитера Европе. Будет искать признаки жизни под ледяной коркой.',
     'orbit': 'орбита вокруг Юпитера', 'period': 'в пути', 'launched': '2024', 'speed': '~25 км/с',
     'orbitType': 'deep', 'orbitRadius': 250, 'orbitSpeed': 0.005, 'satSize': 3.5,
     'img': 'images/satellites/europa.jpeg', 'diameter': '~30 м (с панелями)', 'distance': 'в пути к Юпитеру', 'mass': '~6 т',
     'color': '#4DD0E1'}
]

# ═══ ЧЁРНЫЕ ДЫРЫ ═══
BLACKHOLES = [
    {'title': 'Sagittarius A*',
     'text': 'Сверхмассивная чёрная дыра в центре Млечного Пути массой около 4.3 миллиона солнечных масс.',
     'details': 'Sagittarius A* — сверхмассивная чёрная дыра в центре нашей галактики на расстоянии 26 000 световых лет. В мае 2022 года команда EHT опубликовала первое изображение Sgr A*.',
     'stats': [{'label': 'Масса', 'value': '4.3 млн солнечных'}, {'label': 'Расстояние', 'value': '26 000 св. лет'}, {'label': 'Год открытия', 'value': '1974'}, {'label': 'Первое фото', 'value': '2022'}],
     'img': 'images/blackholes/sagittarius.png'},
    {'title': 'M87*',
     'text': 'Первая чёрная дыра, которую удалось сфотографировать (2019 год).',
     'details': 'M87* — сверхмассивная чёрная дыра в центре эллиптической галактики M87. Масса 6.5 млрд солнечных масс.',
     'stats': [{'label': 'Масса', 'value': '6.5 млрд солнечных'}, {'label': 'Расстояние', 'value': '55 млн св. лет'}, {'label': 'Диаметр горизонта', 'value': '~40 млрд км'}, {'label': 'Длина джета', 'value': '5 000 св. лет'}],
     'img': 'images/blackholes/m87.png'},
    {'title': 'Горизонт событий',
     'text': 'Граница, за которой ничто, даже свет, не может покинуть чёрную дыру.',
     'details': 'Горизонт событий — невидимая граница вокруг чёрной дыры, за которой гравитация не выпускает даже свет.',
     'stats': [{'label': 'Радиус Шварцшильда', 'value': '~3 км/М☉'}, {'label': 'Скорость убегания', 'value': '= скорости света'}, {'label': 'Время пересечения', 'value': 'мгновенно'}, {'label': 'Для наблюдателя', 'value': 'объект замедляется'}],
     'img': 'images/blackholes/event-horizon.png'},
    {'title': 'Спагеттификация',
     'text': 'Эффект растягивания объекта в тонкую нить при падении в чёрную дыру.',
     'details': 'Спагеттификация — эффект приливных сил чёрной дыры, растягивающий объект.',
     'stats': [{'label': 'Для Земли', 'value': '~3000 км до горизонта'}, {'label': 'Для человека', 'value': '~1 м растяжения'}, {'label': 'Защита', 'value': 'только сверхмассивные ЧД'}, {'label': 'Открыто', 'value': '1970-е'}],
     'img': 'images/blackholes/spaghettification.png'},
    {'title': 'Излучение Хокинга',
     'text': 'Теоретическое излучение, из-за которого чёрные дыры испаряются.',
     'details': 'Излучение Хокинга — теоретическое открытие Стивена Хокинга, 1974 год. ЧД массой с Солнце испарится за 10⁶⁷ лет.',
     'stats': [{'label': 'Температура', 'value': '~60 наноКельвин'}, {'label': 'Время жизни', 'value': '10⁶⁷ лет'}, {'label': 'Предсказано', 'value': '1974, Хокинг'}, {'label': 'Подтверждено', 'value': 'теоретически'}],
     'img': 'images/blackholes/hawking-radiation.png'},
    {'title': 'Сингулярность',
     'text': 'Точка в центре чёрной дыры, где плотность и гравитация бесконечны.',
     'details': 'Сингулярность — точка в центре чёрной дыры, где вещество сжато до бесконечно малого объёма.',
     'stats': [{'label': 'Размер', 'value': 'бесконечно малый'}, {'label': 'Плотность', 'value': 'бесконечность'}, {'label': 'Температура', 'value': 'бесконечность'}, {'label': 'Законы физики', 'value': 'не работают'}],
     'img': 'images/blackholes/singularity.png'}
]

BH_TYPES = [
    {'title': 'Звёздные чёрные дыры', 'body': 'Образуются после коллапса массивных звёзд. Масса от 3 до нескольких десятков солнечных масс.'},
    {'title': 'Сверхмассивные чёрные дыры', 'body': 'В центрах галактик. Масса от миллионов до миллиардов солнечных масс.'},
    {'title': 'Промежуточные чёрные дыры', 'body': 'Масса от сотен до десятков тысяч солнечных масс.'},
    {'title': 'Первичные чёрные дыры', 'body': 'Гипотетические ЧД из первых секунд после Большого взрыва.'},
    {'title': 'Вращающиеся чёрные дыры (Керра)', 'body': 'Вращаются. Создают эргосферу вокруг себя.'}
]

# ═══ ГАЛАКТИКИ ═══
GALAXIES = [
    {'name': 'Млечный Путь', 'type': 'Спиральная с перемычкой', 'typeKey': 'spiral',
     'distance': '0 (наша)', 'distanceMly': 0, 'diameter': '~100 000 св. лет', 'diameterNum': 100000,
     'mass': '1.5 трлн M☉', 'stars': '200–400 млрд', 'starsNum': 300000000000, 'age': '~13.6 млрд лет',
     'description': 'Наша родная галактика — спиральная с перемычкой. Содержит Солнечную систему.',
     'details': 'Спиральная галактика с перемычкой. Содержит 200-400 миллиардов звёзд. В центре Стрелец A* массой 4.3 млн солнечных.',
     'facts': ['200-400 млрд звёзд', 'Стрелец A* в центре', '4 рукава + перемычка', 'Галактический год 230 млн лет'],
     'color': '#9CB4D8', 'glow': '#5A6896', 'img': 'images/galaxies/milky-way.png'},
    {'name': 'Андромеда', 'type': 'Спиральная', 'typeKey': 'spiral',
     'distance': '2.537 млн св. лет', 'distanceMly': 2.537, 'diameter': '~152 000 св. лет', 'diameterNum': 152000,
     'mass': '1.5 трлн M☉', 'stars': '~1 триллион', 'starsNum': 1000000000000, 'age': '~10 млрд лет',
     'description': 'Ближайшая к нам крупная галактика. Столкнётся с Млечным Путём через 4.5 млрд лет.',
     'details': 'Ближайшая крупная спиральная галактика. Содержит триллион звёзд. Приближается 110 км/с.',
     'facts': ['Видна невооружённым глазом', 'Столкнётся через 4.5 млрд лет', 'Триллион звёзд', 'Приближается 110 км/с'],
     'color': '#C9B7E5', 'glow': '#8A7AB8', 'img': 'images/galaxies/andromeda.png'},
    {'name': 'Треугольник', 'type': 'Спиральная', 'typeKey': 'spiral',
     'distance': '2.73 млн св. лет', 'distanceMly': 2.73, 'diameter': '~60 000 св. лет', 'diameterNum': 60000,
     'mass': '50 млрд M☉', 'stars': '~40 млрд', 'starsNum': 40000000000, 'age': '~10 млрд лет',
     'description': 'Третья по величине галактика Местной группы. Видна в бинокль.',
     'details': 'Содержит туманность NGC 604 — одну из крупнейших областей H II.',
     'facts': ['Третья в Местной группе', 'Видна в бинокль', 'Область H II — NGC 604', '40 млрд звёзд'],
     'color': '#B5D4C9', 'glow': '#7DA89A', 'img': 'images/galaxies/triangulum.png'},
    {'name': 'Сомбреро', 'type': 'Спиральная', 'typeKey': 'spiral',
     'distance': '29.3 млн св. лет', 'distanceMly': 29.3, 'diameter': '~50 000 св. лет', 'diameterNum': 50000,
     'mass': '800 млрд M☉', 'stars': '~100 млрд', 'starsNum': 100000000000, 'age': '~13 млрд лет',
     'description': 'Знаменита яркой белой перемычкой и пылевой полосой.',
     'details': 'В центре чёрная дыра массой миллиард солнечных.',
     'facts': ['Чёрная дыра 1 млрд M☉', 'Похожа на шляпу', '2000 шаровых скоплений', 'Фотогеничная'],
     'color': '#E5D4A1', 'glow': '#BFA06A', 'img': 'images/galaxies/sombrero.png'},
    {'name': 'Водоворот', 'type': 'Спиральная', 'typeKey': 'spiral',
     'distance': '23 млн св. лет', 'distanceMly': 23, 'diameter': '~76 000 св. лет', 'diameterNum': 76000,
     'mass': '~160 млрд M☉', 'stars': '~100 млрд', 'starsNum': 100000000000, 'age': '~12 млрд лет',
     'description': 'Знаменитая взаимодействующая галактика с компаньоном NGC 5195.',
     'details': 'Первая с открытой спиральной структурой (1845). Взаимодействует с NGC 5195.',
     'facts': ['Первая спираль (1845)', 'Взаимодействует с NGC 5195', 'Гранд-дизайн', 'Звездообразование'],
     'color': '#9BB4D8', 'glow': '#5A78A8', 'img': 'images/galaxies/whirlpool.png'},
    {'name': 'Большое Магелланово Облако', 'type': 'Неправильная', 'typeKey': 'irregular',
     'distance': '163 000 св. лет', 'distanceMly': 0.163, 'diameter': '~14 000 св. лет', 'diameterNum': 14000,
     'mass': '~138 млрд M☉', 'stars': '~30 млрд', 'starsNum': 30000000000, 'age': '~13 млрд лет',
     'description': 'Карликовая галактика-спутник Млечного Пути.',
     'details': 'Содержит туманность Тарантул. Здесь вспыхнула SN 1987A.',
     'facts': ['Видна невооружённым глазом', 'Туманность Тарантул', 'Спутник Млечного Пути', 'SN 1987A'],
     'color': '#DEC18C', 'glow': '#A88A4F', 'img': 'images/galaxies/lmc.png'},
    {'name': 'Малое Магелланово Облако', 'type': 'Карликовая неправильная', 'typeKey': 'irregular',
     'distance': '206 000 св. лет', 'distanceMly': 0.206, 'diameter': '~7 000 св. лет', 'diameterNum': 7000,
     'mass': '~7 млрд M☉', 'stars': '~3 млрд', 'starsNum': 3000000000, 'age': '~13 млрд лет',
     'description': 'Вторая карликовая галактика-спутник Млечного Пути.',
     'details': 'Связано с БМО Магеллановым потоком.',
     'facts': ['Магелланов поток', 'Спутник Млечного Пути', '100× меньше', 'SN 1987A'],
     'color': '#C9A8D8', 'glow': '#8A6FA8', 'img': 'images/galaxies/smc.png'},
    {'name': 'Галактика Сигара', 'type': 'Звёздная вспышка', 'typeKey': 'starburst',
     'distance': '12 млн св. лет', 'distanceMly': 12, 'diameter': '~40 000 св. лет', 'diameterNum': 40000,
     'mass': '~30 млрд M☉', 'stars': '~30 млрд', 'starsNum': 30000000000, 'age': '~13 млрд лет',
     'description': 'Галактика с мощнейшим звёздообразованием — 10 звёзд в год.',
     'details': 'M82. Взаимодействует с M81.',
     'facts': ['10 звёзд/год', 'Взаимодействует с M81', 'Мощнейшее ИК-излучение', 'Сверхветер'],
     'color': '#EF9B7A', 'glow': '#B86A4F', 'img': 'images/galaxies/cigar.png'},
    {'name': 'Чёрный Глаз', 'type': 'Спиральная', 'typeKey': 'spiral',
     'distance': '24 млн св. лет', 'distanceMly': 24, 'diameter': '~70 000 св. лет', 'diameterNum': 70000,
     'mass': '~100 млрд M☉', 'stars': '~100 млрд', 'starsNum': 100000000000, 'age': '~13 млрд лет',
     'description': 'Знаменита тёмной пылевой полосой перед ярким ядром.',
     'details': 'Уникальна тем, что диски вращаются в противоположных направлениях.',
     'facts': ['Диски вращаются противоположно', 'Поглощает меньшую галактику', 'Тёмная полоса', 'Спящая красавица'],
     'color': '#A9A6B8', 'glow': '#544757', 'img': 'images/galaxies/black-eye.png'},
    {'name': 'Подсолнух', 'type': 'Спиральная', 'typeKey': 'spiral',
     'distance': '27 млн св. лет', 'distanceMly': 27, 'diameter': '~73 000 св. лет', 'diameterNum': 73000,
     'mass': '~100 млрд M☉', 'stars': '~100 млрд', 'starsNum': 100000000000, 'age': '~13 млрд лет',
     'description': 'Одна из ярчайших галактик на небе с ярким жёлтым ядром.',
     'details': 'Спираль с перемычкой. Содержит 400 млрд звёзд.',
     'facts': ['Жёлтое ядро', 'Спираль с перемычкой', '400 млрд звёзд', 'Спутник-карлик'],
     'color': '#E5C452', 'glow': '#B89633', 'img': 'images/galaxies/sunflower.png'},
    {'name': 'Вертушка', 'type': 'Спиральная', 'typeKey': 'spiral',
     'distance': '21 млн св. лет', 'distanceMly': 21, 'diameter': '~85 000 св. лет', 'diameterNum': 85000,
     'mass': '~1 трлн M☉', 'stars': '~200 млрд', 'starsNum': 200000000000, 'age': '~13 млрд лет',
     'description': 'Гигантская галактика с чёткими спиральными рукавами.',
     'details': 'Вдвое больше Млечного Пути. Содержит 3 трлн звёзд.',
     'facts': ['2× больше Млечного Пути', '3 трлн звёзд', 'Видна плашмя', 'Много областей H II'],
     'color': '#B5C9E5', 'glow': '#7A98C8', 'img': 'images/galaxies/pinwheel.png'},
    {'name': 'IC 1101', 'type': 'Эллиптическая', 'typeKey': 'elliptical',
     'distance': '1 млрд св. лет', 'distanceMly': 1000, 'diameter': '~6 млн св. лет', 'diameterNum': 6000000,
     'mass': '~50 трлн M☉', 'stars': '~100 трлн', 'starsNum': 100000000000000, 'age': '~12 млрд лет',
     'description': 'Самая большая известная галактика во Вселенной.',
     'details': 'В скоплении Abell 2029. 60× больше Млечного Пути.',
     'facts': ['Самая большая', '60× больше Млечного Пути', '100 трлн звёзд', 'ЧД 100 млрд M☉'],
     'color': '#E5B89C', 'glow': '#B8845E', 'img': 'images/galaxies/ic1101.png'},
    {'name': 'NGC 1275', 'type': 'Активная (сейфертовская)', 'typeKey': 'active',
     'distance': '230 млн св. лет', 'distanceMly': 230, 'diameter': '~100 000 св. лет', 'diameterNum': 100000,
     'mass': '~1 трлн M☉', 'stars': '~200 млрд', 'starsNum': 200000000000, 'age': '~10 млрд лет',
     'description': 'Активная галактика в центре скопления Персея.',
     'details': 'Чёрная дыра 340 млн M☉ активно поглощает материю.',
     'facts': ['ЧД 340 млн M☉', 'Ярчайшая в рентгене', 'Скопление Персея', '3C 84'],
     'color': '#EF7A7A', 'glow': '#B84444', 'img': 'images/galaxies/ngc1275.png'},
    {'name': 'Колесо Телеги', 'type': 'Кольцевая', 'typeKey': 'ring',
     'distance': '500 млн св. лет', 'distanceMly': 500, 'diameter': '~150 000 св. лет', 'diameterNum': 150000,
     'mass': '~50 млрд M☉', 'stars': '~50 млрд', 'starsNum': 50000000000, 'age': '~5 млрд лет',
     'description': 'Кольцевая галактика редкого типа.',
     'details': 'Получила форму из-за столкновения ~200 млн лет назад.',
     'facts': ['Кольцевой тип', 'Ударная волна', '200 млн лет', 'Расширяется 200 км/с'],
     'color': '#7AB8E5', 'glow': '#4A88B8', 'img': 'images/galaxies/cartwheel.png'}
]

# ═══ ФАКТЫ ═══
FACTS = [
    {'n': '01', 'title': 'Скорость света', 'text': 'Свет от Солнца до Земли идёт 8 минут 20 секунд.',
     'details': 'Скорость света в вакууме — 299 792 458 м/с.',
     'stats': [{'label': 'Скорость', 'value': '299 792 458 м/с'}, {'label': 'От Солнца', 'value': '8 мин 20 сек'}, {'label': '1 св. год', 'value': '9.46 трлн км'}, {'label': 'От Луны', 'value': '1.3 сек'}]},
    {'n': '02', 'title': 'Чёрные дыры', 'text': 'M87* в 6.5 миллиарда раз тяжелее Солнца.',
     'details': 'EHT получил первое фото ЧД в 2019 году. В 2022 — Sgr A*.',
     'stats': [{'label': 'M87*', 'value': '6.5 млрд M☉'}, {'label': 'Sgr A*', 'value': '4.3 млн M☉'}, {'label': 'Первое фото', 'value': '2019'}, {'label': 'M87* расстояние', 'value': '55 млн св. лет'}]},
    {'n': '03', 'title': 'Возраст Вселенной', 'text': 'Вселенной около 13.8 миллиарда лет.',
     'details': 'Большой взрыв — ~13.8 млрд лет назад.',
     'stats': [{'label': 'Вселенная', 'value': '13.8 млрд лет'}, {'label': 'Земля', 'value': '4.5 млрд лет'}, {'label': 'Человечество', 'value': '~300 000 лет'}, {'label': 'Старые звёзды', 'value': '~13 млрд лет'}]},
    {'n': '04', 'title': 'Нейтронные звёзды', 'text': 'Нейтронная звезда 20 км может весить больше Солнца.',
     'details': 'Чайная ложка весит как гора. Пульсары до 716 об/сек.',
     'stats': [{'label': 'Диаметр', 'value': '~20 км'}, {'label': 'Масса', 'value': '1.4-2.3 M☉'}, {'label': 'Плотность', 'value': '10¹⁷ кг/м³'}, {'label': 'Вращение', 'value': 'до 716 об/сек'}]},
    {'n': '05', 'title': 'Тёмная материя', 'text': 'Только 5% Вселенной — обычное вещество.',
     'details': '27% тёмная материя, 68% тёмная энергия.',
     'stats': [{'label': 'Обычная', 'value': '5%'}, {'label': 'Тёмная материя', 'value': '27%'}, {'label': 'Тёмная энергия', 'value': '68%'}, {'label': 'Открыта', 'value': '1933, Цвикки'}]},
    {'n': '06', 'title': 'Число галактик', 'text': 'В наблюдаемой Вселенной 2 трлн галактик.',
     'details': 'Hubble Deep Field показал тысячи галактик в "пустом" участке.',
     'stats': [{'label': 'Галактик', 'value': '2 трлн'}, {'label': 'Звёзд в Млечном Пути', 'value': '200-400 млрд'}, {'label': 'Ближайшая', 'value': 'Андромеда'}, {'label': 'Звёзд в Андромеде', 'value': '~1 трлн'}]},
    {'n': '07', 'title': 'Спутники Земли', 'text': 'Более 9000 спутников вращаются вокруг Земли.',
     'details': 'Starlink — более 6000 спутников для глобального интернета.',
     'stats': [{'label': 'Всего', 'value': '>9000'}, {'label': 'Starlink', 'value': '>6000'}, {'label': 'Первый', 'value': '1957, СССР'}, {'label': 'Скорость', 'value': '~7.9 км/с'}]},
    {'n': '08', 'title': 'Альфа Центавра', 'text': 'Ближайшая звёздная система — 4.24 св. лет.',
     'details': 'Parker Solar Probe летит 700 000 км/ч. До Альфы Центавра — 6500 лет.',
     'stats': [{'label': 'Расстояние', 'value': '4.24 св. лет'}, {'label': 'Время полёта', 'value': '6500 лет'}, {'label': 'Parker', 'value': '700 000 км/ч'}, {'label': 'Starshot', 'value': '20-30 лет'}]}
]

RANDOM_FACTS = [
    'Солнце — 99.86% массы Солнечной системы.',
    'Земля сплющена у полюсов на 21 км.',
    'На Луне небо всегда чёрное.',
    'Кольца Сатурна — миллиарды частиц льда.',
    'Проксима Центавра — 4.24 св. лет.',
    '24 человека летали к Луне, 12 высаживались.',
    'В наблюдаемой Вселенной более 2 трлн галактик.',
    'Нейтронная звезда 20 км весит больше Солнца.',
    'Возраст Вселенной — 13.8 млрд лет.',
    'Только 5% массы Вселенной — обычное вещество.',
    'Гора Олимп на Марсе — самый высокий вулкан.',
    'Внутри Сатурна и Юпитера идут алмазные дожди.',
    'Каждый день на Землю падает 100 тонн космической пыли.',
    'На Солнце поместилось бы 1.3 миллиона Земель.',
    'Уран — самая холодная планета (-224°C).',
    'Венера — самая горячая (+465°C).',
    'На Меркурии сутки длиннее года.',
    'Плотность Сатурна меньше плотности воды.',
    'Voyager 1 удалился на 24 млрд км.',
    'Каждый атом в нашем теле родился в ядре звезды.'
]

QUIZ_QUESTIONS = [
    {'q': 'Какая планета самая большая?', 'opts': ['Сатурн', 'Юпитер', 'Нептун', 'Уран'], 'a': 1},
    {'q': 'Сколько планет в Солнечной системе?', 'opts': ['7', '9', '8', '10'], 'a': 2},
    {'q': 'Какая планета ближайшая к Солнцу?', 'opts': ['Венера', 'Земля', 'Марс', 'Меркурий'], 'a': 4},
    {'q': 'Самая высокая гора в Солнечной системе?', 'opts': ['Эверест', 'Олимп', 'Элизий', 'Асида'], 'a': 1},
    {'q': 'Сколько спутников у Марса?', 'opts': ['0', '1', '2', '4'], 'a': 2},
    {'q': 'Какая планета с самыми известными кольцами?', 'opts': ['Юпитер', 'Уран', 'Нептун', 'Сатурн'], 'a': 3},
    {'q': 'Что такое световой год?', 'opts': ['Единица времени', 'Расстояние за год', 'Масса звезды', 'Яркость звезды'], 'a': 1},
    {'q': 'Наша галактика?', 'opts': ['Андромеда', 'Магелланово облако', 'Млечный Путь', 'Водоворот'], 'a': 2},
    {'q': 'Какая планета вращается "лёжа на боку"?', 'opts': ['Нептун', 'Марс', 'Уран', 'Юпитер'], 'a': 2},
    {'q': 'Из чего состоит Солнце?', 'opts': ['Гелий и кислород', 'Водород и гелий', 'Азот и водород', 'Кислород и углерод'], 'a': 1},
    {'q': 'Что такое горизонт событий?', 'opts': ['Кольцо пыли', 'Граница невозврата', 'Орбита спутника', 'Слой атмосферы'], 'a': 1},
    {'q': 'Какой телескоп сфотографировал первую ЧД?', 'opts': ['Хаббл', 'Уэбб', 'EHT', 'Кеплер'], 'a': 2}
]

SIZE_COMPARISON = [
    {'name': 'Солнце', 'color': '#FFD740', 'glow': '#FF6D00', 'diameter': 1392000, 'type': 'Звезда', 'description': 'Жёлтый карлик класса G2V. 99.86% массы Солнечной системы.'},
    {'name': 'Сириус A', 'color': '#A8C8FF', 'glow': '#6090E0', 'diameter': 2380000, 'type': 'Звезда', 'description': 'Самая яркая звезда ночного неба.'},
    {'name': 'Арктур', 'color': '#FFA040', 'glow': '#FF6020', 'diameter': 25700000, 'type': 'Звезда', 'description': 'Красный гигант.'},
    {'name': 'Бетельгейзе', 'color': '#FF6030', 'glow': '#FF3010', 'diameter': 700000000, 'type': 'Звезда', 'description': 'Красный сверхгигант. Поглотила бы Марс.'},
    {'name': 'UY Щита', 'color': '#FF4020', 'glow': '#FF2010', 'diameter': 1708000000, 'type': 'Звезда', 'description': 'Один из крупнейших красных сверхгигантов.'},
    {'name': 'Меркурий', 'color': '#B8A98E', 'glow': '#8C7B63', 'diameter': 4879, 'type': 'Планета', 'description': 'Ближайшая к Солнцу планета.'},
    {'name': 'Венера', 'color': '#E5AC52', 'glow': '#C98F3C', 'diameter': 12104, 'type': 'Планета', 'description': 'Самая горячая планета.'},
    {'name': 'Земля', 'color': '#6E7FA3', 'glow': '#4A5A7C', 'diameter': 12742, 'type': 'Планета', 'description': 'Наш дом. Единственная обитаемая планета.'},
    {'name': 'Марс', 'color': '#C97B5A', 'glow': '#A35840', 'diameter': 6779, 'type': 'Планета', 'description': 'Красная планета. Самый высокий вулкан.'},
    {'name': 'Юпитер', 'color': '#DEC18C', 'glow': '#BFA06A', 'diameter': 139820, 'type': 'Планета', 'description': 'Крупнейшая планета. Большое Красное Пятно.'},
    {'name': 'Сатурн', 'color': '#E5D4A1', 'glow': '#C9B57E', 'diameter': 116460, 'type': 'Планета', 'description': 'Планета с кольцами из льда и камней.'},
    {'name': 'Уран', 'color': '#9FB8C9', 'glow': '#7393A8', 'diameter': 50724, 'type': 'Планета', 'description': 'Ледяной гигант, вращается "лёжа на боку".'},
    {'name': 'Нептун', 'color': '#7B89B5', 'glow': '#5A6896', 'diameter': 49244, 'type': 'Планета', 'description': 'Самая далёкая планета. Ветры до 2100 км/ч.'},
    {'name': 'Луна', 'color': '#C9C9C9', 'glow': '#8A8A8A', 'diameter': 3475, 'type': 'Спутник', 'description': 'Естественный спутник Земли.'},
    {'name': 'Ио', 'color': '#FFD740', 'glow': '#E5A030', 'diameter': 3643, 'type': 'Спутник', 'description': 'Самое вулканически активное тело.'},
    {'name': 'Европа', 'color': '#C9D8E5', 'glow': '#8FA0B8', 'diameter': 3122, 'type': 'Спутник', 'description': 'Океан под ледяной коркой 100 км.'},
    {'name': 'Ганимед', 'color': '#A8B0B8', 'glow': '#707880', 'diameter': 5268, 'type': 'Спутник', 'description': 'Крупнейший спутник в Солнечной системе.'},
    {'name': 'Титан', 'color': '#E5A050', 'glow': '#B07030', 'diameter': 5150, 'type': 'Спутник', 'description': 'Единственный с плотной атмосферой.'},
    {'name': 'Плутон', 'color': '#A89C8E', 'glow': '#7A6E5F', 'diameter': 2376, 'type': 'Карликовая', 'description': 'Карликовая планета с 2006 года.'},
    {'name': 'Церера', 'color': '#8A8A8A', 'glow': '#5A5A5A', 'diameter': 940, 'type': 'Карликовая', 'description': 'Карликовая планета в поясе астероидов.'},
    {'name': 'Эрида', 'color': '#E5E5E5', 'glow': '#A0A0A0', 'diameter': 2326, 'type': 'Карликовая', 'description': 'Открытие привело к "понижению" Плутона.'}
]


# ═══ СОЗДАНИЕ ТАБЛИЦ ═══
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS sun (
        id INTEGER PRIMARY KEY DEFAULT 1, name TEXT, emoji TEXT,
        description TEXT, fact TEXT, diameter TEXT, mass TEXT, temp TEXT,
        type TEXT, age TEXT, composition TEXT, core TEXT, img TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS planets (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,
        emoji TEXT, color TEXT, glow TEXT, tag TEXT, tagColor TEXT,
        dist REAL, radius REAL, speed REAL, tilt REAL, gravity REAL,
        hasRing INTEGER DEFAULT 0, description TEXT,
        diameter TEXT, dayLen TEXT, year TEXT, distance TEXT, mass TEXT,
        moons TEXT, fact TEXT, img TEXT,
        p3d_radius REAL, p3d_hasRings INTEGER DEFAULT 0,
        p3d_moonCount INTEGER DEFAULT 0, p3d_emissive TEXT,
        p3d_emissiveIntensity REAL DEFAULT 0, p3d_type TEXT,
        p3d_texture TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS satellites (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,
        fullName TEXT, owner TEXT, emoji TEXT, description TEXT,
        orbit TEXT, period TEXT, launched TEXT, speed TEXT,
        orbitType TEXT, orbitRadius REAL, orbitSpeed REAL, satSize REAL, img TEXT,
        diameter TEXT, distance TEXT, mass TEXT, color TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS blackholes (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT UNIQUE NOT NULL,
        text TEXT, details TEXT, img TEXT, stats TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS bh_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS galaxies (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,
        type TEXT, typeKey TEXT, distance TEXT, distanceMly REAL,
        diameter TEXT, diameterNum INTEGER, mass TEXT, stars TEXT, starsNum INTEGER,
        age TEXT, description TEXT, details TEXT, facts TEXT,
        color TEXT, glow TEXT, img TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, n TEXT UNIQUE,
        title TEXT, text TEXT, details TEXT, stats TEXT, views INTEGER DEFAULT 0)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS random_facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT,
        opt1 TEXT, opt2 TEXT, opt3 TEXT, opt4 TEXT, correct INTEGER)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS size_comparison (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,
        color TEXT, glow TEXT, diameter INTEGER, type TEXT, description TEXT)''')
    
    conn.commit()
    conn.close()


def seed_database():
    init_db()
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    print("⏳ Заполняю базу данных...")
    
    # Солнце
    cursor.execute('DELETE FROM sun')
    cursor.execute('''INSERT INTO sun (id, name, emoji, description, fact, diameter, mass, temp, type, age, composition, core, img)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (SUN['name'], SUN['emoji'], SUN['description'], SUN['fact'], SUN['diameter'],
         SUN['mass'], SUN['temp'], SUN['type'], SUN['age'], SUN['composition'], SUN['core'], SUN['img']))
    print("  ☀️  Солнце добавлено")
    
    # Планеты
    cursor.execute('DELETE FROM planets')
    for p in PLANETS:
        cursor.execute('''INSERT INTO planets (name, emoji, color, glow, tag, tagColor, dist, radius, speed,
                            tilt, gravity, hasRing, description, diameter, dayLen, year,
                            distance, mass, moons, fact, img,
                            p3d_radius, p3d_hasRings, p3d_moonCount, p3d_emissive, p3d_emissiveIntensity, p3d_type,
                            p3d_texture)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (p['name'], p['emoji'], p['color'], p['glow'], p['tag'], p['tagColor'],
             p['dist'], p['radius'], p['speed'], p['tilt'], p['gravity'],
             1 if p.get('hasRing') else 0,
             p['description'], p['diameter'], p['dayLen'], p['year'],
             p['distance'], p['mass'], p['moons'], p['fact'], p['img'],
             p.get('p3d_radius', 1.0), p.get('p3d_hasRings', 0), p.get('p3d_moonCount', 0),
             p.get('p3d_emissive', ''), p.get('p3d_emissiveIntensity', 0), p.get('p3d_type', 'Планета'),
             p.get('p3d_texture', '')))
    print(f"  🪐  {len(PLANETS)} планет добавлено")
    
    # Спутники
    cursor.execute('DELETE FROM satellites')
    for s in SATELLITES:
        cursor.execute('''INSERT INTO satellites (name, fullName, owner, emoji, description, orbit, period,
                               launched, speed, orbitType, orbitRadius, orbitSpeed, satSize, img,
                               diameter, distance, mass, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (s['name'], s['fullName'], s['owner'], s['emoji'], s['description'], s['orbit'],
             s['period'], s['launched'], s['speed'], s['orbitType'],
             s['orbitRadius'], s['orbitSpeed'], s['satSize'], s['img'],
             s.get('diameter', ''), s.get('distance', ''), s.get('mass', ''),
             s.get('color', '#A9C4E0')))
    print(f"  🛰  {len(SATELLITES)} спутников добавлено")
    
    # Чёрные дыры
    cursor.execute('DELETE FROM blackholes')
    for bh in BLACKHOLES:
        cursor.execute('''INSERT INTO blackholes (title, text, details, img, stats)
            VALUES (?, ?, ?, ?, ?)''',
            (bh['title'], bh['text'], bh['details'], bh['img'],
             json.dumps(bh.get('stats', []), ensure_ascii=False)))
    print(f"  🕳  {len(BLACKHOLES)} чёрных дыр добавлено")
    
    cursor.execute('DELETE FROM bh_types')
    for t in BH_TYPES:
        cursor.execute('INSERT INTO bh_types (title, body) VALUES (?, ?)', (t['title'], t['body']))
    print(f"  📚  {len(BH_TYPES)} типов ЧД добавлено")
    
    # Галактики
    cursor.execute('DELETE FROM galaxies')
    for g in GALAXIES:
        cursor.execute('''INSERT INTO galaxies (name, type, typeKey, distance, distanceMly, diameter,
                                 diameterNum, mass, stars, starsNum, age, description,
                                 details, facts, color, glow, img)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (g['name'], g['type'], g['typeKey'], g['distance'], g['distanceMly'],
             g['diameter'], g['diameterNum'], g['mass'], g['stars'], g['starsNum'],
             g['age'], g['description'], g['details'],
             json.dumps(g.get('facts', []), ensure_ascii=False),
             g['color'], g['glow'], g['img']))
    print(f"  🌌  {len(GALAXIES)} галактик добавлено")
    
    # Факты
    cursor.execute('DELETE FROM facts')
    for f in FACTS:
        cursor.execute('''INSERT INTO facts (n, title, text, details, stats)
            VALUES (?, ?, ?, ?, ?)''',
            (f['n'], f['title'], f['text'], f['details'],
             json.dumps(f.get('stats', []), ensure_ascii=False)))
    print(f"  📖  {len(FACTS)} фактов добавлено")
    
    cursor.execute('DELETE FROM random_facts')
    for rf in RANDOM_FACTS:
        cursor.execute('INSERT INTO random_facts (text) VALUES (?)', (rf,))
    print(f"  💫  {len(RANDOM_FACTS)} случайных фактов добавлено")
    
    cursor.execute('DELETE FROM quiz_questions')
    for q in QUIZ_QUESTIONS:
        cursor.execute('''INSERT INTO quiz_questions (question, opt1, opt2, opt3, opt4, correct)
            VALUES (?, ?, ?, ?, ?, ?)''',
            (q['q'], q['opts'][0], q['opts'][1], q['opts'][2], q['opts'][3], q['a']))
    print(f"  ❓  {len(QUIZ_QUESTIONS)} вопросов квиза добавлено")
    
    # Size comparison
    cursor.execute('DELETE FROM size_comparison')
    for sc in SIZE_COMPARISON:
        cursor.execute('''INSERT INTO size_comparison (name, color, glow, diameter, type, description)
            VALUES (?, ?, ?, ?, ?, ?)''',
            (sc['name'], sc['color'], sc['glow'], sc['diameter'], sc['type'], sc.get('description', '')))
    print(f"  📏  {len(SIZE_COMPARISON)} объектов для сравнения добавлено")
    
    conn.commit()
    conn.close()
    print("\n✅ База данных успешно заполнена!")


if __name__ == '__main__':
    print("=" * 50)
    print("🌌 COSMOS — Заполнение базы данных")
    print("=" * 50)
    seed_database()
    print("\nТеперь можно запускать сервер: python app.py")
