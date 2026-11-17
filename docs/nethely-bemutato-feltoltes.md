# Nethely – Pixi bemutató feltöltése

Dátum: 2026-11-17. Célwebcím: **pixidevdesign.nhely.hu**. Tárhely neve: **pixidevdesign**, ingyenes Nethely-csomag.

A felhasználó külön döntése: egyelőre bemutatóoldal, belépés és online ajánlatküldés nélkül. A teljes Laravel/React alkalmazás megmarad külön, helyi fejlesztési változatban.

## Mi kerül fel?

Főoldal, szolgáltatások, portfólió és két esettanulmány, a School Management kollázzsal. Nincs regisztráció, belépés, megerősítő űrlap, AI-demó vagy online ajánlatküldés. A kapcsolat résznél még nincs végleges telefonszám; ezt nem pótoltuk kitalált adattal.

A külön Vite entrypoint a BrochureApp; nem importálja a teljes alkalmazás AuthProviderét vagy API-modulját. A normál `npm --prefix frontend run build` továbbra is a teljes helyi alkalmazást készíti a frontend/dist mappába.

```bash
npm --prefix frontend test
npm --prefix frontend run build:brochure
python3 scripts/package-brochure.py
```

Kimenet: `artifacts/pixidevdesign-nethely-bemutato.zip`, mellette SHA256 ellenőrzőösszeg. A ZIP csak a frontend/dist-brochure statikus fájljait és a deployment/nethely/brochure.htaccess konfigurációt tartalmazza. Nem kell feltölteni backend/, vendor/, node_modules/, forráskód-, napló- vagy .env fájlokat. A csomagoló váratlan fájltípusnál, rejtett buildfájlnál vagy ismert API-/kulcsjelölőnél leáll; ez célzott ellenőrzés, nem általános titokfelderítő audit.

## Feltöltés a webes fájlkezelővel vagy SFTP-vel

1. A Nethely ügyfélfelületén válaszd a **pixidevdesign** tárhelyet, azon a **pixidevdesign.nhely.hu** webcímet. Ellenőrizd a hozzá rendelt dokumentumgyökér könyvtárát; a pontos útvonalat a fiókban kell megállapítani, nem feltételezzük, hogy public_html.
2. Ha már vannak ott fájlok, előbb tölts le mentést. Ismeretlen meglévő oldalt ne törölj automatikusan.
3. A ZIP tartalmát közvetlenül ebbe a dokumentumgyökérbe másold vagy csomagold ki. A gyökérben legyen index.html, .htaccess, assets/ és images/. Ne maradjon plusz körülölelő dist-brochure/ mappa. Ha a felület nem tud ZIP-et kicsomagolni, bontsd ki helyben és a fájlokat töltsd fel SFTP-vel.
4. A .htaccess rejtett fájl: ennek feltöltését külön ellenőrizd. Nem kell PHP-t, adatbázist vagy migrációt indítani.
5. Nyisd meg a webcímet és külön a /portfolio, /portfolio/pixi-weboldal, /portfolio/school-management útvonalakat; mindegyiken próbáld az oldalfrissítést is. A menü, kategóriaszűrés és a képek mobilon is legyenek használhatók.
6. A /belepes, /regisztracio, /demo, /ajanlat és /api/v1/status címek ezen a tárhelyen nem elérhető funkciók; a mellékelt Apache-szabály 404-et ad rájuk. Ha a portfólió mélylinkje 404-et ad, ellenőrizd a .htaccess helyét és a mod_rewrite engedélyezését. 500 esetén állítsd vissza a korábbi fájlokat és nézd meg a szervernaplót; ne távolíts el találomra védelmi beállításokat.
7. Sikeres ellenőrzés után a feltöltött ZIP-et nem szükséges a nyilvános gyökérben tartani. Az előző verzió mentését tartsd meg a tárhelyen kívül.

## A csomag korlátai

A Nethely nyilvános leírása szerint az ingyenes .nhely.hu névhez nem adnak ingyenes SSL-t; az ingyenes csomagban nincs cron, SSH/Composer vagy szolgáltatói mentés. Forrás: https://www.nethely.hu/ingyenes-tarhely (ellenőrizve: 2026-11-17). Emiatt választottunk statikus bemutatót. Érvényes HTTPS-t ennél a konkrét webcímnél még nem igazoltunk; nincs kikényszerített HTTPS-átirányítás és nincs HSTS a csomagban. A CSP connect-src és form-action szabálya none: a bemutató nem indít API-kéréseket vagy űrlapküldést.

A tényleges tárhelyfiókhoz az asszisztens jelenleg nem fér hozzá: a saját Chrome vezérlése engedélyhiány miatt nem sikerült, a beépített böngésző IP-tiltási figyelmeztetést mutatott, majd a böngészőeszköz elérhetősége megszakadt. Feltöltés és éles működés ezért még nem igazolt.

## Helyi csomagellenőrzés

58 frontendteszt és mindkét build sikeres. Az elkészült ZIP helyi Apache 2.4 kiszolgálásában 4 fő-/portfólióútvonal, minden csomagolt publikus fájl, 8 tiltott/hiányzó útvonal és a CSP/nosniff fejlécek ellenőrizve. Ez nem igazolja a Nethely fiókbeállításait vagy az élő feltöltést.
