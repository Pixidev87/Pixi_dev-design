export const categories = [
  { id: "all", label: "Összes munka" },
  { id: "web", label: "Webfejlesztés" },
  { id: "automation", label: "AI és automatizáció" },
  { id: "design", label: "Design és UX/UI" },
];

export const projects = [
  {
    slug: "pixi-weboldal",
    title: "Pixi — a saját digitális műhelyünk",
    subtitle: "Egy arculat. Egy felület. Mögötte működő rendszer.",
    kind: "Saját bemutatóprojekt",
    status: "Fejlesztés alatt · helyben működik",
    year: "2026",
    categories: ["web", "design"],
    cover: "/images/pixi-web-desktop.jpg",
    mobile: "/images/pixi-web-mobile.jpg",
    coverAlt:
      "A Pixi megvalósított főoldala: sötét háttér, mustársárga kiemelés és felületgrafikák.",
    description:
      "A saját weboldalunkon kapcsoltuk össze a karakteres megjelenést, a fiókkezelést és az ajánlatkérés folyamatát.",
    problem:
      "Egy helyen szerettük volna megmutatni, hogyan gondolkodunk a fejlesztésről, a designról és az automatizációról. A bemutatkozás mellé olyan kapcsolatfelvételi folyamat kellett, amely nem ér véget egy elküldés gombbal.",
    solution:
      "React felületet és Laravel API-t építettünk. Az ajánlatkérés adatbázisba kerül, a visszaigazolást újrapróbálható háttérfolyamat küldi. A fiókokhoz e-mail-megerősítés és lejáró belépési token tartozik. Az AI-demóhoz szerveroldali, összesen öt sikeres használatot engedélyező keretet készítettünk.",
    result:
      "Helyben működő, mobilon is használható alkalmazás készült. A valódi böngészős próbán a regisztrációtól az e-mail-megerősítésig, valamint az ajánlatküldés és kijelentkezés folyamatán is végigmentünk.",
    evidence: [
      "19 frontendteszt és 89 backendteszt / 484 ellenőrzés a 6. szakasz lezárásakor.",
      "Valódi ajánlatmentés és Mailpit-visszaigazolás mobilos böngészőpróbával.",
      "Hat párhuzamos kérés tesztje: az utolsó demóhasználatot csak egy kérés fogyaszthatja el.",
    ],
    limits:
      "Az élő Claude-próba halasztva van, ezért az AI-demó jelenleg kikapcsolt. Éles SMTP, végleges kontaktadatok és nyilvános élesítés még nem készült el. Ez saját fejlesztési bemutató, nem ügyfélmunka; üzleti megtérülést vagy ügyféloldali javulást még nem mértünk.",
    stack: ["React", "Vite", "Laravel", "MySQL", "Redis", "Docker"],
  },
  {
    slug: "school-management",
    title: "School Management — iskolai adminisztráció",
    subtitle: "Összekapcsolt iskolai folyamatok egy webalkalmazásban.",
    kind: "Saját fejlesztési projekt",
    status: "Forráskód és saját képernyőképek alapján",
    year: "2026",
    categories: ["web"],
    cover: "/images/school-management-showcase.png",
    coverAlt:
      "School Management bemutatókollázs: áttekintő, osztályok és jelenlét képernyők.",
    coverCaption:
      "AI-val szerkesztett bemutatókollázs a saját alkalmazásképeinkből; nem változtatás nélküli képernyőkép.",
    description:
      "Iskolai adminisztráció React felülettel és Laravel API-val: diákok, tanárok, jelenlét, órarend és kapcsolódó intézményi modulok.",
    problem:
      "A diákok, tanárok, osztályok és tantárgyak nyilvántartása összefügg a jelenléttel, az órarenddel és a vizsgákkal. A projekt ezeket a kapcsolódó iskolai adminisztrációs területeket szervezi közös webalkalmazásba.",
    solution:
      "A React felülethez Laravel API és Sanctum-alapú hitelesítés kapcsolódik. Az útvonalak külön modulokat biztosítanak az alapnyilvántartásokhoz, a jelenléthez, az órarendhez és a vizsgákhoz. Díjkezelési, könyvtári, közlekedési és értesítési felületek is szerepelnek a forrásban; egyes API-műveleteket adminisztrátori vagy tanári szerepkör véd.",
    result:
      "A repositoryban megtalálhatók a modulok React-oldalai, API-útvonalai és Laravel controllerei. A portfólió a megvizsgált forráskód szerkezetét és funkcióit mutatja be. Élő működést, tesztfutási eredményt vagy intézményi használatot ebben az áttekintésben nem ellenőriztünk.",
    resultTitle: "A forrásban megvalósított részek",
    evidence: [
      "A React útvonaltérkép diák-, tanár-, osztály-, tantárgy-, jelenléti, órarend- és vizsgafelületeket tartalmaz.",
      "A Laravel API-ban díjak, könyvtár, közlekedés és értesítések kezelésére is vannak útvonalak.",
      "A függőségfájlok React, Vite, Bootstrap, React Query, Laravel és Sanctum használatát jelzik.",
    ],
    evidenceNote:
      "Forráskód-áttekintés és átadott képernyőképek: 2026-11-16. A felsorolás nem helyettesít futtatást vagy funkcionális tesztet.",
    limits:
      "A projektet most nem telepítettük és nem futtattuk. Éles elérhetőséget, tesztlefedettséget, valós intézményi alkalmazást és üzleti eredményeket nem igazoltunk. A bemutatókollázs a felhasználó által átadott alkalmazásképek AI-val szerkesztett összeállítása.",
    stack: ["React", "Vite", "Bootstrap", "React Query", "Laravel", "Sanctum"],
    modules: [
      "Diákok és tanárok",
      "Osztályok és tantárgyak",
      "Jelenlét és órarend",
      "Vizsgák és eredmények",
      "Díjak és könyvtár",
      "Közlekedés és értesítések",
    ],
    sources: [
      {
        label: "GitHub repository",
        url: "https://github.com/Pixidev87/school_management",
      },
      {
        label: "Laravel API-útvonalak",
        url: "https://github.com/Pixidev87/school_management/blob/main/school-management/routes/api.php",
      },
      {
        label: "React felületek útvonaltérképe",
        url: "https://github.com/Pixidev87/school_management/blob/main/school-management/resources/js/routes/AppRoutes.jsx",
      },
    ],
  },
];
