export interface TranslationMap {
  title: string;
  tagline: string;
  driving: string;
  garage: string;
  cargoMaster: string;
  mechanicsBay: string;
  freightExchange: string;
  routeSandbox: string;
  dashboard: string;
  tripLogs: string;
  offline: string;
  online: string;
  cash: string;
  driverLevel: string;
  speed: string;
  rpm: string;
  gear: string;
  airPressure: string;
  fuel: string;
  engineTemp: string;
  handbrake: string;
  jakeBrake: string;
  headlights: string;
  hazardLights: string;
  horn: string;
  wipers: string;
  startEngine: string;
  stopEngine: string;
  accelerate: string;
  brake: string;
  steerLeft: string;
  steerRight: string;
  deliveryComplete: string;
  cargoWeight: string;
  safetyScore: string;
  distanceRemaining: string;
  routeSelect: string;
  educationalTip: string;
}

export const TRANSLATIONS: Record<'en' | 'tl' | 'ceb' | 'ilo', TranslationMap> = {
  en: {
    title: 'Byaheng Pinoy: Philippine Truck Simulator',
    tagline: 'Realistic Heavy Hauling & Logistics for Young Truckers',
    driving: 'Drive Highway',
    garage: 'Truck Customizer',
    cargoMaster: 'Cargo Master (Kids Logistics)',
    mechanicsBay: 'Mechanic Bay (Engine Care)',
    freightExchange: 'Freight Market',
    routeSandbox: 'Route Designer',
    dashboard: 'Fleet Dashboard',
    tripLogs: 'Past Delivery Logs',
    offline: 'Offline Mode Active',
    online: 'Cloud Synced',
    cash: 'Balance',
    driverLevel: 'Driver Rank',
    speed: 'Speed',
    rpm: 'RPM',
    gear: 'Gear',
    airPressure: 'Air Tank',
    fuel: 'Diesel Level',
    engineTemp: 'Water Temp',
    handbrake: 'Parking Air Brake',
    jakeBrake: 'Jake Exhaust Brake',
    headlights: 'Headlights',
    hazardLights: 'Hazard Flashers',
    horn: 'Air Horn',
    wipers: 'Rain Wipers',
    startEngine: 'Start Ignition',
    stopEngine: 'Stop Engine',
    accelerate: 'Throttle / Gas',
    brake: 'Service Brake',
    steerLeft: 'Steer Left',
    steerRight: 'Steer Right',
    deliveryComplete: 'Delivery Mission Complete!',
    cargoWeight: 'Cargo Weight',
    safetyScore: 'Safety Score',
    distanceRemaining: 'Distance to Destination',
    routeSelect: 'Choose Philippine Route',
    educationalTip: 'Mechanics & Logistics Fact',
  },
  tl: {
    title: 'Byaheng Pinoy: Philippine Truck Simulator',
    tagline: 'Makatotohanang Pagmamaneho ng Malalaking Truck sa Pinas',
    driving: 'Byahe sa Kalsada',
    garage: 'Garahe at Palamuti',
    cargoMaster: 'Aralin sa Karga (Logistics)',
    mechanicsBay: 'Talyer ng Mekaniko',
    freightExchange: 'Bilihan ng Kontrata',
    routeSandbox: 'Gumawa ng Ruta',
    dashboard: 'Talaan ng Sasakyan',
    tripLogs: 'Kasaysayan ng Byahe',
    offline: 'Offline Mode (Walang Internet)',
    online: 'Naka-Sync sa Cloud',
    cash: 'Pera',
    driverLevel: 'Antas ng Lisensya',
    speed: 'Bilis (km/h)',
    rpm: 'Rebolusyon (RPM)',
    gear: 'Kambyo',
    airPressure: 'Hangin ng Preno',
    fuel: 'Kargang Krudo',
    engineTemp: 'Init ng Makina',
    handbrake: 'Preno sa Paradahan',
    jakeBrake: 'Jake Engine Brake',
    headlights: 'Ilaw sa Harap',
    hazardLights: 'Hazard Flashers',
    horn: 'Busina ng Truck',
    wipers: 'Wiper sa Ulan',
    startEngine: 'Paandarin ang Makina',
    stopEngine: 'Patayin ang Makina',
    accelerate: 'Tapak sa Gasolina',
    brake: 'Tapak sa Preno',
    steerLeft: 'Kumanan / Pakaliwa',
    steerRight: 'Pakanan',
    deliveryComplete: 'Mabuhay! Nakarating ang Karga!',
    cargoWeight: 'Timbang ng Karga',
    safetyScore: 'Marka sa Kaligtasan',
    distanceRemaining: 'Natitirang Distansya',
    routeSelect: 'Pumili ng Ruta sa Pilipinas',
    educationalTip: 'Kaalaman sa Mekanika at Karga',
  },
  ceb: {
    title: 'Byaheng Pinoy: Philippine Truck Simulator',
    tagline: 'Tinuod nga Pagmaneho sa Dagkong Truck sa Kabisay-an ug Pinas',
    driving: 'Biyahe sa Dalan',
    garage: 'Garahe ug Porma',
    cargoMaster: 'Edukasyon sa Karga',
    mechanicsBay: 'Talyer sa Mekaniko',
    freightExchange: 'Komprahanan sa Karga',
    routeSandbox: 'Paghimo ug Dalan',
    dashboard: 'Dashboard sa Sakyanan',
    tripLogs: 'Listahan sa Byahe',
    offline: 'Offline Mode',
    online: 'Konektado sa Cloud',
    cash: 'Salapi',
    driverLevel: 'Ranggo sa Lisensya',
    speed: 'Kadasig (km/h)',
    rpm: 'RPM sa Makina',
    gear: 'Kambyo',
    airPressure: 'Hangin sa Preno',
    fuel: 'Krudo',
    engineTemp: 'Init sa Tubig',
    handbrake: 'Preno sa Pag-park',
    jakeBrake: 'Jake Exhaust Brake',
    headlights: 'Suga sa Gabii',
    hazardLights: 'Hazard Light',
    horn: 'Pusina sa Truck',
    wipers: 'Wiper sa Ulan',
    startEngine: 'Paandaron ang Makina',
    stopEngine: 'Palungon ang Makina',
    accelerate: 'Tuntong sa Gas',
    brake: 'Tuntong sa Preno',
    steerLeft: 'Pawalhon',
    steerRight: 'Patuhoon',
    deliveryComplete: 'Maayo Kaayo! Nahatod ang Karga!',
    cargoWeight: 'Gibug-aton sa Karga',
    safetyScore: 'Marka sa Kaluwasan',
    distanceRemaining: 'Nahabiling Gilay-on',
    routeSelect: 'Pilia ang Imong Byahe',
    educationalTip: 'Pahimangno sa Mekaniko',
  },
  ilo: {
    title: 'Byaheng Pinoy: Philippine Truck Simulator',
    tagline: 'Pannagna ti Dackel a Truck iti Amianan ken Pilipinas',
    driving: 'Agbyahe iti Kalsada',
    garage: 'Garahe ken Pagpapintas',
    cargoMaster: 'Adal iti Karga',
    mechanicsBay: 'Pagtarimaan ti Makina',
    freightExchange: 'Negosyo ti Karga',
    routeSandbox: 'Mangaramid iti Dalan',
    dashboard: 'Pangbuyaan ti Byahe',
    tripLogs: 'Listaan ti Byahe',
    offline: 'Offline Mode',
    online: 'Naka-konektar',
    cash: 'Kuartang Naurnong',
    driverLevel: 'Lisensia ti Driver',
    speed: 'Kapartak',
    rpm: 'RPM',
    gear: 'Kambyo',
    airPressure: 'Angin ti Preno',
    fuel: 'Krudo',
    engineTemp: 'Pudot ti Makina',
    handbrake: 'Preno ti Pag-park',
    jakeBrake: 'Jake Retarder',
    headlights: 'Silaw',
    hazardLights: 'Hazard',
    horn: 'Busina',
    wipers: 'Wiper ti Tudo',
    startEngine: 'Patangkenen ti Makina',
    stopEngine: 'Iseppeng ti Makina',
    accelerate: 'Apsaan ti Gas',
    brake: 'Apsaan ti Preno',
    steerLeft: 'Agsikod iti Kannigid',
    steerRight: 'Agsikod iti Kannawan',
    deliveryComplete: 'Nalpas ti Byahe! Naimbag a Panagdaliasat!',
    cargoWeight: 'Dagsen ti Karga',
    safetyScore: 'Score ti Kinatalged',
    distanceRemaining: 'Mabati a Kaadayo',
    routeSelect: 'Pilien ti Byahe',
    educationalTip: 'Pannakaammo iti Truck',
  }
};
