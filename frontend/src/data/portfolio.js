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
];
