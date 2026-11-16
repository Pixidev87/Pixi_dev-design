# Pixi web & webdesign — folyamatnapló

**Utolsó frissítés:** 2026-11-16
**Alap dokumentumok:** `kozos-weboldal-tervdokumentum.md`, `kozos-weboldal-lepesrol-lepesre.html`

---

## Munkamód

- Minden szakasz külön session-ben fut, a projekten belül.
- A munkát Zoli az asszisztens segítségével végzi. Minden fő szakasz külön sessionben folytatódik; új sessiont Zoli indít.
- Minden elkészült, ellenőrzött kódváltoztatást commit és GitHub-push követ.
- Alapelv: clean code (rövid, egy felelősségű függvények és osztályok, beszédes nevek, tesztelt viselkedés).
- Sail a Laravel környezet.

---

## Szakaszok állapota

| # | Szakasz | Felelős | Állapot | Megjegyzés |
|---|---|---|---|---|
| 0 | Globális megkötések | — | kész | a tervdokumentumból |
| 1 | Design és vázlat | asszisztens, Zoli és párja | **részben kész** | első főoldalterv Zoli által elfogadva; külön demó- és űrlapterv, teljes design-rendszer és végleges szövegek még hátravannak |
| 2 | Laravel alap | Zoli | **kész** | Sail, MySQL/Redis, státusz API és teljes rétegfelosztás működik; tesztek igazolva |
| 3 | Igényfelmérő űrlap (backend) | Zoli | **kész** | validáció, MySQL-mentés, enum, Resource, tranzakciós levélsor és Mailpit-kézbesítés ellenőrizve |
| 4 | Regisztráció és e-mail | Zoli | **kész** | Sanctum-token, aláírt megerősítés, újraküldés, kijelentkezés, kezdő 5-ös keret; 52 teszt / 306 assertion |
| 5 | Demó és 5-használat-keret | Zoli | **kód és tesztek kész; élő próba halasztva** | 89 teszt / 484 assertion; MySQL párhuzamosság, idempotencia, saját demó–ajánlat kapcsolat kész; kulcs/modell nincs beállítva |
| 6 | React frontend | Zoli | **kész, helyben ellenőrizve** | főoldal, hitelesítés/megerősítés, demófelület és ajánlatkérés; 19 frontendteszt; élő AI-próba továbbra is halasztva |
| 7 | Portfólió | közösen | **technikai rész kész; szövegjóváhagyás nyitott** | szűrhető lista és esettanulmány-sablon kész; Zoli a Pixi saját oldalát választotta; 26 frontendteszt sikeres |
| 8 | Minőség és indítás | közösen | nincs elkezdve | |

---

## Döntések

- **Vállalkozás neve:** Pixi web & webdesign
- **Demó:** regisztrációnként összesen 5 használat, a regisztrációtól számítva, nem napi keret
- **Demó hozzáférés:** csak regisztrációval és e-mail-címmel
- **Visszaigazolás:** igen, a látogató e-mailt kap
- **Telefonszám és foglalás:** a főoldalon jelenik meg
- **Backend:** Laravel, Sail-lel
- **Frontend:** React
- **Tervdokumentum:** jóváhagyva (2026-11-15)
- **Oldal:** görgethető, mobilra igazodó.
- **Első főoldalterv:** az asszisztens készítette, Zoli elfogadta; később módosítható.
- **Logó és referenciamunkák:** később érkeznek; helyük előkészítve.
- **Vizuális irány:** modern, magazinszerű; mustársárga és petróleum kiemelések, sötét–világos váltások, nagy tipográfia, aszimmetrikus képrács.
- **Git-repó gyökere:** `pixi-web/`; Laravel: `backend/`, később React: mellette.
- **GitHub:** https://github.com/Pixidev87/Pixi_dev-design
- **Fő ág:** `main`, távoli ág: `origin/main`.

---

## Napló

- **2026-11-15** — Tervdokumentum jóváhagyva. Lépésről lépésre terv elkészült (HTML). Döntések: egy szakasz = egy session, clean code, minden lépés előtt kérdés, Sail. Kezdés a design szakasszal.

- **2026-11-15 – főoldalterv:** elkészült a görgethető designprototípus: https://pixi-web-design-v1.unitedhotel4.chatgpt.site . Zoli elfogadta az első változatot. A prototípusban nincs működő AI, regisztráció, ajánlatküldés vagy foglalás; a végleges React-megvalósítás még hátravan.
- **2026-11-16 – környezet:** Laravel 13.42.0 telepítve. Sail elindult, a Laravel-oldal betöltődött. Az alap users/cache/jobs migrációk lefutottak; Redis-ellenőrzés: `PONG`.
- **2026-11-16 – GitHub:** Git inicializálva a `/Users/pixidev/Desktop/portfolio/pixi-web` mappában. README és backend feltöltve. Első commit: `399aa31` — `chore: add initial Laravel project` (61 fájl). A `git push -u origin main` sikeres, a GitHub-tartalmat ellenőriztük. A `backend/.env` kizárását a `git check-ignore` igazolta; a vendor és node_modules sincs a feltöltött fájlok között.
- **2026-11-16 – tervfrissítés:** a HTML-tervben kipipálva a főoldalterv, a Laravel/Sail telepítés, a MySQL/Redis és a Git/GitHub feladat. A 2. szakasz nincs teljesen lezárva.

---

## Nyitott feladatok

- Külön demó- és ajánlatkérő képernyőtervek, hiba- és betöltési állapotok.
- Teljes design-rendszer és végleges szövegek; logó és saját projektanyagok feltöltése.
- Backend rétegek és példa API-végpont: elkészültek (2–3. szakasz).
- Tesztfuttatás igazolva: 89 teszt, 484 assertion; adatbázisos, queue-, hitelesítési, megerősítési, demó- és párhuzamossági tesztekkel együtt.

---

## Következő lépés

A 7. szakasz technikai része kész: portfóliólista és szűrés a főoldalon és a /portfolio útvonalon; a választott Pixi saját bemutatóprojekt esettanulmányának szövege elkészült a /portfolio/pixi-weboldal oldalon. A projekt kiválasztását Zoli jóváhagyta, az elkészült szöveg végső jóváhagyása még nyitott. Design és végleges kontaktadatok továbbra is pótlandók.

Következő technikai szakasz: 8., minőségellenőrzés. Nyilvános élesítéshez még szükséges a végleges domain/HTTPS, éles levelezés és tartalmi/designjóváhagyás. Az 5. szakasz élő Claude-próbája Zoli kérésére halasztva marad; a demó a frontendben kikapcsolt. Új szakasz felhasználói kérésre indul.

## 2026-11-16 – 2. szakasz: tesztek és API-alap

- Az eredeti alaptesztek Sailben sikeresek: 2 teszt, 2 assertion.
- Elkészült a `GET /api/v1/status` végpont: routes → StatusController → StatusService → JSON; névvel ellátott, v1 verziójú útvonal.
- API Feature tesztek: válasz tartalma és Content-Type, valamint ismeretlen API-cím JSON 404 válasza.
- Ellenőrzés: 4 teszt, 10 assertion sikeres; Pint sikeres; Nginxen (`localhost:8082`) valós HTTP-próba sikeres.
- Laravel Boost telepítve a backend/AGENTS.md előírása alapján.
- A Controller–Service alap kész. Model, Form Request és API Resource az ajánlatkérő funkciónál következik; üres mappákat nem hoztunk létre.
- Következő fejlesztés: 3. szakasz, ajánlatkérő backend. Az alaptesztek sikere önmagában nem igazolja az adatbázis teszt alatti működését.

## 2026-11-16 – 3. szakasz: ajánlatkérő backend

- Új végpont: `POST /api/v1/inquiries` (az API-alap v1 verziózását követi), 201-es Resource válasszal.
- `StoreInquiryRequest`: kötelező név/e-mail/leírás, típus- és hosszkorlát, magyar validációs üzenetek. Hibás adat: 422. Kéréskorlátozás: 5/perc/IP, utána 429.
- `Inquiry`, migráció és factory elkészült; `InquiryStatus` backed enum: new/processed/sent. Új állapot szerveroldali. A Resource csak azonosítót, állapotot és időpontot ad vissza.
- `demo_session_id` nullable előkészített oszlop; nem fogadunk el kliens által megadott azonosítót. Külső kulcs és tulajdonosellenőrzés később, a demómodell létrehozásakor.
- `InquiryService`: ajánlat és adatbázisos e-mail-feladat közös tranzakciója. Queue-hiba visszagörgeti a mentést. A külön `inquiry-worker` szolgáltatás feldolgozza a leveleket; SMTP-hiba után az ajánlat megmarad és a levél újrapróbálható (3 kísérlet, 30/120 másodperc várakozás).
- Magyar `InquiryReceived` Mailable, escaped névvel. Feladónév Pixi web & webdesign; a helyi feladócím tesztérték, élesítés előtt cserélendő.
- TDD bizonyíték: az első érvénytelen e-mail teszt a hiányzó végpont miatt 404-gyel piros volt, a megvalósítás után 422-vel zöld.
- Teljes ellenőrzés: **21 teszt, 131 assertion sikeres**, Pint sikeres, Compose valid, git diff whitespace-ellenőrzés rendben. MySQL `testing` adatbázis, RefreshDatabase előtti védőellenőrzéssel.
- A worker első indításakor Sail entrypoint/jogosultságütközés jelentkezett; közvetlen PHP entrypointtal javítva. A worker fut, a teljes próbaküldés DONE.
- Fejlesztői migráció lefutott. Nginxen beküldött helyi minta: ajánlat #1, `pixi-stage3@example.test`; a levél igazoltan megérkezett a Mailpitbe (`http://localhost:8026`). A megjelölt tesztadat és levél megmaradt ellenőrizhető mintának.
- A kód lényeges részei a beszélgetésben bemutatva; futtatási és queue-hibakezelési útmutató a repository README-jében. Frontend és éles levelezés későbbi feladat.
- A 3. szakasz kész; következő a 4. szakasz. Commit és push állapota a lentebbi Git-bejegyzésben szerepel.

### 3. szakasz – Git-állapot

A kezdeti automatikus elutasítás után Zoli kifejezetten engedélyezte a commitot és a main ágra feltöltést. A 3. szakasz commitja: `6897a00` — `feat: add validated inquiries with reliable queued confirmations` (16 fájl). A `git push origin main` sikeres: `143b33a..6897a00`, main → main. A 3. szakasz a GitHubon is elérhető. A 3. szakasz lezárásakor a napló és a HTML-terv még csak a repository mellett volt meg. A 4. szakasztól a docs/ mappában verziózott másolatot is tartunk.

## 2026-11-16 – 4. szakasz: regisztráció és e-mail-megerősítés

- Felhasználói engedély: a 4. szakasz megvalósítása, a két dokumentum és a Git frissítése.
- Laravel Sanctum 4.4.0 telepítve; personal_access_tokens és demo_uses_left migrációk lefutottak a helyi fejlesztői adatbázison.
- `POST /api/v1/register`: név, normalizált/egyedi e-mail, minimum 12 karakteres, maximum 72 bájtos jelszó és megerősítése. Bcrypt hash; nincs jelszó a Resource válaszban. Nulla bájt kizárva. A kliens nem állíthat saját megerősített állapotot vagy demókeretet.
- A regisztrációban az új felhasználó és a magyar VerifyEmailNotification queue-feladata közös tranzakcióba kerül. Levélsor-hiba visszagörgeti a felhasználó létrehozását. A meglévő inquiry-mail sor/inquiry-worker végzi a küldést (3 próbálkozás, 30/120 másodperc).
- `POST /api/v1/login`: Sanctum bearer token 24 órás lejárattal, az adatbázisban hashként. Hibás jelszó és ismeretlen e-mail egységes hibát ad. `POST /api/v1/logout`: az aktuális token visszavonása, más eszközök tokenjeinek megtartásával.
- `GET /api/v1/me`: érvényes bearer token és megerősített e-mail kell. Token nélkül 401, megerősítés nélkül 403. Az API Accept fejléc nélkül is JSON-választ ad.
- `GET /api/v1/email/verify/{user}/{hash}`: 60 percig érvényes aláírt link, e-mail-hash ellenőrzéssel. Böngészőből token nélkül nyitható; nem jelentkeztet be. Módosított/lejárt link elutasítva. Az érvényes link ismételt kattintása idempotens siker, nem írja felül a megerősítés időpontját.
- `POST /api/v1/email/verification-notification`: bejelentkezve újraküldhető. Már megerősített címre nem küld új levelet.
- Korlátok: regisztráció 5/perc/IP; login 5/perc/e-mail+IP és 20/perc/IP; újraküldés 3/perc/fiók; link 20/perc/IP. A limiter az e-mail kis-/nagybetűit és szélső szóközeit egységesíti.
- `demo_uses_left` alapértéke 5; a belépés nem tölti újra. A felhasználás és a Claude-integráció az 5. szakasz feladata.
- Korábbi konfigurációhiba javítva: az inquiry-mail kapcsolat véletlen másolata eltávolítva a failover kapcsolatnév-listából. Regressziós teszt védi.
- Tesztelőször: az első regisztrációs teszt 404 miatt piros, majd implementáció után 422-vel zöld.
- Végső ellenőrzés: **52 teszt, 306 assertion sikeres**, Pint sikeres, Compose-konfiguráció és git diff whitespace rendben. Tesztek kizárólag a testing MySQL-adatbázison, RefreshDatabase előtti védelemmel.
- Valós helyi Nginx–Mailpit próba: felhasználó #1, `pixi-stage4-1794843113185528000@example.test`. Regisztráció 201, login 200, megerősítés előtt /me 403, levél beérkezett, link 200, megerősítve /me 200, logout 204, visszavont token 401. Keret pontosan 5. A tesztfiók/levél megmaradt; jelszó és token nem került fájlba vagy naplókimenetbe. A teszttokent visszavontuk.
- Git: a megvalósítás és README commitja `6da9f64` — `feat: add Sanctum authentication and queued email verification`. A `git push origin main` sikeres: `6897a00..6da9f64`.
- A két dokumentum portfolio/ mappában lévő példányai frissítve. Azonos tartalmú, verziózott másolatuk a pixi-web/docs/ mappába kerül, külön dokumentációs commitban.
- A 4. szakasz kész. Következő az 5. szakasz; éles SMTP és a React felület még nincs bekötve.

## 2026-11-16 – 5. szakasz: demó, kvóta és eredménymentés

- Felhasználói jóváhagyás: az 5. szakasz folytatása a két dokumentum és a Git frissítésével. Külön döntés: **az élő Claude-próbát későbbre hagyjuk**. Nem történt fizetős hívás, nincs API-kulcs vagy modell a helyi beállításban.
- `POST /api/v1/demo`: Sanctum-token és megerősített e-mail kell; 10–3000 karakteres prompt, UUID Idempotency-Key fejléc. Új eredmény 201, mentett azonos kérés ismétlése 200; azonos kulcs más szöveggel 409. Kéréskorlát: 10/perc/fiók.
- `DemoService`: a felhasználó MySQL-sorának lockForUpdate zárolása. A Claude-hívás alatt is tartott záron belül történik az eredmény mentése és a számláló csökkentése. Nincs automatikus tranzakció- vagy HTTP-újrapróbálkozás. Zárvárakozási időtúllépés/holtpont 503-at ad, újrapróbálható azonos kulccsal.
- Összesen 5 sikeres használat engedélyezett. A 6. új kérés 403, demo_quota_exhausted kóddal és ajánlatkérésre irányító üzenettel. A sikeresen mentett eredmény azonos kulccsal nulla keret mellett is visszaolvasható; a replay nem fogyaszt keretet és nem hívja a szolgáltatót.
- Szolgáltatói hiba vagy timeout: 503; hibás, visszautasított vagy félbeszakadt kimenet: 502. Konfigurációhiány: 503. Ezek, valamint a mentési hiba nem csökkentik a felhasználói keretet. Külső API és adatbázis között nincs elosztott tranzakció: megszakadt folyamatnál szolgáltatói költség előfordulhat mentett eredmény nélkül is.
- `ClaudeService`: fix HTTPS Anthropic Messages API, szerveroldali x-api-key fejléc, rögzített 2023-06-01 API-verzió, konfigurálható modell; output_config.format JSON-séma (summary/recommendation), további helyi kimenetellenőrzéssel. 1024 kimeneti token, 5/25 másodperces kapcsolódási/teljes timeout; nincs redirect-követés. A nyers szolgáltatói hiba és a kulcs nem jut a válaszba. Hivatalos referencia: https://platform.claude.com/docs/en/build-with-claude/structured-outputs és https://platform.claude.com/docs/en/api/versioning .
- `DemoSession` modell/factory/migráció: fiók, prompt, JSON-eredmény, modell és fiókonként egyedi idempotenciakulcs tárolva. `GET /api/v1/demo/{id}`: csak a megerősített tulajdonos olvashatja; idegen/nem létező eredmény 404.
- Az inquiries.demo_session_id külső kulcsa elkészült. Ajánlatkéréshez csak bejelentkezett, megerősített tulajdonos kapcsolhat saját demóeredményt. A demó nélküli ajánlatkérés továbbra is nyilvános.
- TDD: a demó első hozzáférési tesztje hiányzó végpont miatt 404-gyel piros, megvalósítás után a várt 401-gyel zöld.
- Végső teljes tesztcsomag: **89 teszt, 484 assertion sikeres**. Pint és whitespace-ellenőrzés rendben. A külön testing MySQL-adatbázist védő ellenőrzések minden adatbázisos teszt előtt aktívak.
- Valós párhuzamossági ellenőrzés hat külön PHP-folyamattal, közös MySQL-zárakkal: utolsó 1 felhasználásnál 1 új eredmény, 5 elutasítás, 1 szimulált API-hívás. Azonos kulcsú párhuzamos ismétlésnél 1 új eredmény és 5 visszaolvasás, összesen 1 hívás. A tényleges MySQL-záridőtúllépés külön tesztje is sikeres, szolgáltatói hívás nélkül.
- Külön tesztek: 5./6. használat határa; idempotencia és kulcsütközés; 401/403/404 tulajdonosi védelem; 422/429 bemenet-/kéréskorlát; szolgáltatói 401/429/500/redirect/timeout; hibás JSON, típus, hossz, refusal/max_tokens; mentési hiba visszagörgetése; saját/idegen demóhoz kapcsolt ajánlat.
- Fejlesztői migrációk lefutottak. Az Nginxen végzett próba konfiguráció nélkül 503-at adott, változatlan 5-ös kerettel; vendégként 401. Élő sikeres Claude-válasz és annak minősége még nincs ellenőrizve.
- Megjelölt helyi próba: felhasználó #2, `pixi-stage5-1794844102806523000@example.test`; a megerősítő levél Mailpitbe érkezett. A próba végén kijelentkeztünk (204), a tokent visszavontuk. Jelszó vagy bearer token nem került fájlba/naplókimenetbe.
- Git: `c8e2b47` — `feat: add transactional demo quota and Claude integration`, main ágra feltöltve (`156da88..c8e2b47`). A README részletes API-szerződést és üzemeltetési korlátokat tartalmaz.
- A napló és a HTML-terv helyi példánya és a repository docs/ mappájában lévő verziózott másolata azonos tartalommal frissül. Az 5. szakasz Claude élő-ellenőrzési jelölőnégyzete szándékosan nyitva marad.

## 2026-11-16 – 6. szakasz: React frontend

- Felhasználói engedély: a 6. szakasz megvalósítása; a napló, a HTML-terv és a Git frissítése továbbra is része a munkamenetnek.
- Önálló frontend/ React + Vite alkalmazás, React Routerrel, központi API-klienssel és memóriában tartott Sanctum bearer tokennel. Ellenőrzött verziók: Node 24.22.1, React 19.3.1, Vite 8.3.8. Lockfájl commitolva, node_modules/dist/.env helyi és kizárt.
- Főoldal: az elfogadott magazinszerű, mustársárga–petróleum arculat, sötét/világos szakaszok, szolgáltatások, szemléltető koncepció, demóblokk és kapcsolat. Saját CSS-grafikák; nincs kitalált ügyfél, eredményszázalék vagy telefonszám. Végleges kontaktadatok, saját referenciák és a végső designjóváhagyás továbbra is hátravan.
- Útvonalak: /, /regisztracio, /belepes, /demo, /ajanlat, /megerosites/{user}/{hash}; ismeretlen útvonalhoz saját 404-felület. Mélylinkek közvetlen megnyitása Nginx SPA-fallbackkel működik.
- Regisztráció/belépés, automatikus belépés regisztráció után, megerősítési kapu, levél-újraküldés, ellenőrzés és kijelentkezés bekötve a valódi API-ra. Gyakori regisztrációs mezőhibák magyar üzenetet kaptak. Függő küldés alatt a gomb letiltott.
- Új felhasználóbarát megerősítő oldal: a levél frontendcímére kattintva megjelenő gomb az eredeti aláírt API-végpontot hívja. A 60 perces lejárat, aláírás, e-mail-hash ellenőrzés és idempotencia megmaradt; régi közvetlen API-linkek továbbra is működnek lejáratukig.
- A token nem kerül URL-be, localStorage-ba vagy sessionStorage-ba. Újratöltés/új lap után új belépés kell. A 401 törli a helyi munkamenetet; kijelentkezés szerveroldali visszavonást kér. A helyi tesztfiókból a böngészős próba végén kijelentkeztünk.
- Demófelület: 5-ös keret megjelenítése; nulla esetén tiltott gomb; szöveges probléma, várakozás, hiba, eredmény és ajánlatba továbbvitel. Új szöveghez új UUID, azonos szöveg sikertelen újrapróbálásához azonos Idempotency-Key. Saját demóeredményből név/e-mail/leírás és demo_session_id előkitöltés.
- VITE_DEMO_AVAILABLE=false: az élő próba halasztása miatt nincs valódi demóhívás a felületről, helyette tájékoztatás és ajánlatkérési lehetőség. Az előkitöltés és sikeres AI-eredmény felülete komponens- és backendteszttel igazolt, élő Claude-válasszal még nem.
- Ajánlatküldés vendégként is működik. Mező- és hálózati hibánál a kitöltés az aktuális oldalon megmarad; siker után azonosítós visszajelzés jelenik meg. Oldal-újratöltés után a piszkozat nem őrződik meg.
- Nginx a frontend/dist buildet olvasási kötettel szolgálja ki a localhost:8082 címen; /api/ és /up Laravelre kerül. Kész helyi használathoz nem kell Vite dev szerver. Fejlesztéshez npm --prefix frontend run dev, port 5174, /api proxyval. Indítás/frissítés és környezeti beállítások a README-ben.
- Frontend környezeti változók: csak nyilvános VITE_CONTACT_PHONE, HTTPS VITE_BOOKING_URL és VITE_DEMO_AVAILABLE. Titkos API-kulcs kizárólag a backend környezeti fájljában lehet.
- Ellenőrzés: **19 frontendteszt sikeres; 89 backendteszt / 484 assertion sikeres**. Vite build, Pint, Nginx-szintaxis és git diff whitespace rendben. A Laraveltesztek a külön testing adatbázist használják.
- Komponenstesztek: vendégkapu, regisztráció és jelszóegyezés, megerősítés/újraküldés, aláírt frontendlink sikeres/lejárt/hiányos esete, API-hibák, letiltott demó, nulla keret, idempotenciakulcs megőrzése újrapróbáláskor, előkitöltött saját ajánlat, duplaküldés tiltása, kijelentkezés.
- Valódi böngészős próba: főoldal 1280-as asztali és 390-es mobilnézetben; 390-es nézetnél nincs vízszintes túlcsordulás. Mobilos ajánlat #2 (pixi-stage6@example.test) elmentve, visszaigazoló levél beérkezett Mailpitbe. Regisztráció (pixi-stage6-ui@example.test, felhasználó #3), megerősítő levél, megerősítés, 5/5 keret, kikapcsolt demó és kijelentkezés sikeres. A kész megerősítő visszajelző oldalt is végigpróbáltuk. Fizetős AI-hívás nem történt.
- Képernyőképek: pixi-web/docs/preview/pixi-stage6-desktop.jpg és pixi-web/docs/preview/pixi-stage6-mobile.jpg. A böngészőben a kész helyi főoldal megnyitva maradt.
- Git: `01901c6` — `feat: add integrated React frontend and email verification pages`, a main ágra feltöltve. A napló és HTML-terv frissítése azonos tartalmú helyi/docs példányokkal követi.
- A 6. szakasz technikai megvalósítása kész. Az 5. szakasz élő elfogadása, a végleges kontakt-/designanyagok, éles SMTP és a 8. szakasz minőségi/élesítési feladatai még nyitottak.

## 2026-11-16 – 7. szakasz: portfólió és első esettanulmány

- Zoli kérésére folytattuk a projektet. Külön kérdésre az első valódi esettanulmánynak **a Pixi saját weboldalát** választotta. A helyi minta/ képei korábbi designreferenciák; nem használtuk őket saját ügyfélmunkaként.
- Közös adatforrás: frontend/src/data/portfolio.js. A Portfolio komponens a főoldalon és külön /portfolio oldalon is működik; új Munkáink menüpont. Kategóriák: összes/web/AI és automatizáció/design. A saját Pixi projekt web/design kategóriákban szerepel; az AI-kategóriában jelenleg üres állapot látszik.
- A szűrőgombok aria-pressed állapotot, a találatszám status visszajelzést kapott. Üres kategóriából egy gomb visszaállítja az összes projektet. Egyetlen projekt kiemelt, széles elrendezést kap; több projekt kétoszlopos listába rendezhető, mobilon egy oszlop.
- Újrahasznosítható CaseStudy oldal: /portfolio/:slug; első példa /portfolio/pixi-weboldal. Probléma → megoldás → eredmény, saját asztali/mobil képernyőkép, fejlesztési bizonyítékok, külön korlátok/nyitott feladatok és ajánlatkérési hivatkozás. Ismeretlen slughoz érthető üres/404-szerű felület és visszalink tartozik.
- A Pixi saját, fejlesztés alatt álló bemutatóprojektként szerepel. Az ellenőrzési számok a 6. szakasz lezárásához kötött fejlesztési bizonyítékok; nem állítunk ügyféloldali üzleti javulást, megtérülést vagy éles AI-működést.
- A szöveg elkészült és megtekinthető. A projektválasztás felhasználói jóváhagyása megtörtént, **az elkészült esettanulmány szövegének végső jóváhagyása még nyitott**. A HTML-terv megfelelő ellenőrzőnégyzete emiatt nem lesz késznek jelölve.
- Ellenőrzés: **26 frontendteszt sikeres** (7 új portfólióteszttel); Vite build és whitespace rendben. Szűrés/üres kategória/visszaállítás, főoldali elérés, részletoldal és lapcím, közvetlen URL, hibás slug, projektadatok következetessége tesztelve.
- A korábbi kijelentkezési teszt túl általános status célzását pontosítottuk: most a portfólió találatszáma is status szerepkört használ. Nem alkalmazáshiba volt; a teljes frontendcsomag újra zöld.
- Backendkód nem módosult; ebben a szakaszban a backendteszteket nem ismételtük. A legutóbbi igazolt eredmény továbbra is 89 backendteszt / 484 assertion a 6. szakaszból.
- Valódi böngészős ellenőrzés: lista, szűrés és visszaállítás, esettanulmány megnyitása, mélylink közvetlen frissítése. 390 pixeles nézetben a portfólió és a részletoldal sem lógott túl vízszintesen. A kész esettanulmány megnyitva maradt a böngészőben.
- Képernyőképek: docs/preview/pixi-stage7-portfolio.jpg és docs/preview/pixi-stage7-case-mobile.jpg. A bemutatott projektfotók a 6. szakasz valódi helyi képernyőképei, frontend/public/images/ alatt.
- Git: `26a4f9e` — `feat: add filterable portfolio and Pixi case study`, a main ágra feltöltve (`bfadf9e..26a4f9e`). A két folyamatdokumentum helyi és docs/ másolata együtt frissül.
- Élő Claude-próba, fizetős hívás és nyilvános élesítés nem történt. Továbbra is nyitott a tartalmi/designjóváhagyás, végleges kontaktadatok, éles SMTP és a 8. szakasz minőségellenőrzése/indítása.
