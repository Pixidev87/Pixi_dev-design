# Pixi web & webdesign

A Pixi web & webdesign közös vállalkozás bemutatkozó és portfólióoldala. A projekt célja, hogy egy helyen mutassa be a webfejlesztési, AI- és automatizációs, valamint grafikai és UX/UI szolgáltatásokat, és egyszerű ajánlatkéréssel kapcsolja össze az érdeklődőket a csapattal.

## Projektállapot

A Laravel 13.42.0 alapalkalmazás Sail környezetben elindult. A MySQL és Redis szolgáltatások működnek, az alap Laravel migrációk lefutottak. A React + Vite frontend elkészült és az Nginxen keresztül kapcsolódik a Laravel API-hoz. Helyi cím: http://localhost:8082 . Regisztráció, e-mail-megerősítés, belépés, ajánlatküldés és a demófelület működik; az élő Claude-próba külön, halasztott feladat.

## Tervezett technológia

- **Backend:** Laravel
- **Frontend:** React
- **Helyi fejlesztőkörnyezet:** Laravel Sail, Docker
- **Adatbázis és cache:** MySQL és Redis
- **AI-demó:** Claude API, kizárólag szerveroldali hívással
- **E-mail:** regisztráció-megerősítés és ajánlatkérési visszaigazolás

## Tervezett funkciók

- Szolgáltatások és portfólió-esettanulmányok bemutatása
- Regisztrációhoz és megerősített e-mail-címhez kötött AI-demó
- Összesen öt demóhasználat felhasználónként
- Demóeredményből előre kitölthető ajánlatkérő űrlap
- E-mailes visszaigazolás
- Telefonszám és időpontfoglalási lehetőség
- Reszponzív és akadálymentes felület

A demó kvótáját szerveroldalon kell ellenőrizni, párhuzamos kéréseknél sem szabad túllépni. Sikertelen AI-hívás esetén a felhasználó kerete nem csökkenhet. A Claude API-kulcs nem kerülhet a böngészőbe vagy a GitHubra.

## Helyi fejlesztés

A projekt Laravel Sailt használ. A parancsokat a Laravel projekt gyökérkönyvtárából futtasd.

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate
```

A Laravel alkalmazás jellemzően a `http://localhost` címen érhető el, a Sail konfigurációjában beállított porttól függően.

Leállítás:

```bash
./vendor/bin/sail down
```

## Környezeti változók

1. Készíts helyi környezeti fájlt a mintából, ha még nincs:

   ```bash
   cp .env.example .env
   ```

2. Állítsd be a helyi adatbázis-, Redis- és levelezési adatokat a `.env` fájlban.
3. Generálj alkalmazáskulcsot:

   ```bash
   ./vendor/bin/sail artisan key:generate
   ```

A valódi titkokat, jelszavakat, API-kulcsokat és a `.env` fájlt soha ne töltsd fel a repóba. A Claude-kulcs később szerveroldali környezeti változóként lesz beállítva.

## Git és GitHub munkafolyamat

A közös alapelv: minden kész, ellenőrzött változtatás külön commitot kap, majd felkerül a GitHubra.

```bash
git status
git add .
git commit -m "Rövid, leíró üzenet"
git push
```

Első feltöltés előtt ellenőrizd, hogy a `.env`, `vendor/`, `node_modules/` és más generált vagy titkos fájlok ki vannak zárva a Gitből. A GitHubon létrehozott üres repository URL-jét add hozzá távoli repóként, majd az első push előtt ellenőrizd a branch nevét és a GitHubon létrehozott alapértelmezett ágat. A pontos első feltöltési parancsokat a repository létrehozása után a kapott URL-hez igazítjuk.

## Állapot és dokumentáció

A design és a következő fejlesztési szakaszok jóváhagyása külön lépésekben történik. Minden fő szakaszt külön sessionben folytatunk. A portfólióképek, a végleges logó és az elérhetőségi adatok később kerülnek be.

## Licenc

A projekt licenceléséről később születik döntés.

## API-alap (2. szakasz)

A parancsokat a `pixi-web/backend` könyvtárból futtasd:

```bash
./vendor/bin/sail artisan test
curl http://localhost:8082/api/v1/status
```

A `GET /api/v1/status` nyilvános végpont válasza:

```json
{"data":{"status":"ok","name":"Pixi web & webdesign","api_version":"v1"}}
```

A kérés útja: `routes/api.php` → `StatusController` → `StatusService` → JSON-válasz. A Controller a HTTP-válaszért, a Service az adatok összeállításáért felel. Ez alkalmazásstátusz, nem adatbázis- vagy Redis-állapotvizsgálat. Az ismeretlen API-útvonalak JSON-formátumú 404-es választ adnak. Model, Form Request és API Resource az ajánlatkérő funkciónál kap szerepet; ehhez az olvasási példához nem szükségesek.

2026-11-16: Sailben 4 teszt és 10 assertion sikeres; Pint sikeres; az Nginxen keresztüli HTTP-próba sikeres. A két eredeti alapteszt önmagában nem teszteli az adatbázis-kapcsolatot. Laravel Boost fejlesztői függőség a projekt AGENTS.md előírása szerint telepítve.

## Ajánlatkérő backend (3. szakasz)

A `POST /api/v1/inquiries` nyilvános végpont kötelező mezői: `name` (legfeljebb 150 karakter), `email` (RFC szerinti e-mail, legfeljebb 254 karakter), `description` (legfeljebb 5000 karakter). A szövegek szélén lévő szóközöket a Laravel eltávolítja. Az állapotot a szerver `new` értékre állítja; a kliens által megadott állapot 422-es hibát ad. Az 5. szakasztól opcionális `demo_session_id` is fogadható: ehhez megerősített e-mail, bearer token és a fiókhoz tartozó demóeredmény szükséges. Külső kulcs védi a kapcsolatot.

```bash
cd backend
./vendor/bin/sail artisan migrate
./vendor/bin/sail up -d inquiry-worker
./vendor/bin/sail artisan test
```

Példakérés (helyi ajánlatot hoz létre, visszaigazolása a Mailpitbe kerül):

```bash
curl -i http://localhost:8082/api/v1/inquiries \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  --data '{"name":"Teszt Elek","email":"elek@example.test","description":"Weboldalt szeretnék."}'
```

Siker: **201**, `{"data":{"id":1,"status":"new","created_at":"…"}}`. Hibás adat: **422**, mezőnkénti `errors`; IP-címenként legfeljebb 5 kérés/perc, utána **429**. Nincs nyilvános ajánlatlista vagy lekérdezés.

Kérés útja: `StoreInquiryRequest` → `InquiryController` → `InquiryService` → `Inquiry` → `InquiryResource`. Az állapot PHP backed enum (`new`, `processed`, `sent`); a levél kézbesítése nem módosítja az ajánlat üzleti állapotát.

Az ajánlat és a visszaigazoló Mailable feladata ugyanabba az adatbázis-tranzakcióba kerül. Az `inquiry-mail` kapcsolat az alkalmazás adatbázisát és a meglévő `jobs` táblát használja. A külön Docker worker ezt a sort olvassa, legfeljebb három próbálkozással (30, majd 120 másodperc várakozás); SMTP-hiba nem törli az ajánlatot. A 201 a mentést és a küldés sorba állítását jelenti. A kézbesítés legalább egyszeri: ritka megszakadásnál ismételt levél előfordulhat. Opcionális UUID Idempotency-Key fejléc esetén azonos tartalom ugyanazt az ajánlatot adja vissza, eltérő tartalom 409; fejléc nélkül ismételt POST új ajánlatot hoz létre.

```bash
./vendor/bin/sail ps inquiry-worker
./vendor/bin/sail logs --tail=30 inquiry-worker
./vendor/bin/sail artisan queue:failed
# A küldési hiba javítása után egy kiválasztott sikertelen feladat újraindítása:
./vendor/bin/sail artisan queue:retry FELADAT_UUID
# Worker kódjának frissítése után:
./vendor/bin/sail restart inquiry-worker
```

A helyi Mailpit felülete ezen a gépen: http://localhost:8026 (a `FORWARD_MAILPIT_DASHBOARD_PORT` szabályozza). A feladó neve Pixi web & webdesign; a cím helyi tesztérték. Éles SMTP és valódi feladói cím az induláskor állítandó be. A frontend bekötése későbbi szakasz.

2026-11-16 ellenőrzés: **21 teszt, 131 assertion**, Pint és Compose-konfiguráció rendben. A MySQL-tesztek kizárólag a `testing` adatbázison futnak; guard védi a RefreshDatabase használatát. Tesztelt a validáció, adatmentés, tranzakciós visszagörgetés, tényleges adatbázisos queue-feldolgozás, SMTP-hiba és újrapróbálkozás, HTML-escape és 429-es korlátozás. Helyi teljes próba: `inquiries.id=1`, címzett `pixi-stage3@example.test`; az ajánlat és a Mailpit-levél megmaradt ellenőrizhető mintának.

## Regisztráció és e-mail-megerősítés (4. szakasz)

Laravel Sanctum 4.4.0 biztosítja a bearer tokenes API-hitelesítést. A `backend/` könyvtárban migrálj, majd indítsd újra a meglévő levélküldő workert:

```bash
./vendor/bin/sail artisan migrate
./vendor/bin/sail restart inquiry-worker
./vendor/bin/sail artisan test
```

| Végpont | Bemenet / védelem | Eredmény |
|---|---|---|
| `POST /api/v1/register` | `name`, `email`, `password`, `password_confirmation` | 201; új, még nem megerősített felhasználó; levél sorba állítva |
| `POST /api/v1/login` | `email`, `password` | 200; egyszer megjelenített bearer token és lejárat |
| `GET /api/v1/me` | bearer token és megerősített e-mail | 200; saját adatok és hátralévő demókeret |
| `POST /api/v1/logout` | bearer token | 204; az aktuális token visszavonva |
| `POST /api/v1/email/verification-notification` | bearer token | 200; nem megerősített felhasználónak új levél |
| `GET /api/v1/email/verify/{user}/{hash}` | a levélben kapott, 60 percig érvényes aláírt URL | 200; megerősítés, ismételt érvényes kattintás is sikeres |

A név kötelező (max. 150 karakter); az e-mailt kisbetűsítjük és egyedivé tesszük. A jelszó legalább 12 karakter, a jelenlegi bcrypt beállítás miatt legfeljebb 72 bájt; nulla bájt nem fogadható el. A jelszó tárolás előtt hashelődik. A `demo_uses_left` és az `email_verified_at` szerveroldali mezők, kliensoldali felülírásuk tiltott. Új fiók pontosan 5 felhasználást kap; a belépés ezt nem tölti újra. Az atomi kvótafogyasztást az 5. szakasz valósítja meg (lásd alább).

A regisztráció a felhasználót és a megerősítő levél adatbázisos queue-feladatát egy tranzakcióban menti. A magyar levél a meglévő `inquiry-mail` soron és `inquiry-worker` szolgáltatáson jut el a Mailpitbe. A helyes `APP_URL` szükséges az aláírt URL-hez (helyben `http://localhost:8082`). A link birtoklása igazolja a postaládához hozzáférést: böngészőből, bearer token nélkül nyitható meg, és nem jelentkezteti be a felhasználót. Lejárt vagy módosított link 403; régi e-mailhez készült link e-mail-változás után nem használható.

A token élettartama 24 óra; az adatbázis csak a hashét tárolja. Megerősítés előtt lehet belépni, kijelentkezni és megerősítő levelet kérni, de a `/me` végpont 403-at ad. Hiányzó, hibás, lejárt vagy visszavont token 401. A kijelentkezés az adott tokent vonja vissza; a többi eszköz tokenje megmarad. Böngészős tokenkezelés és a felületek a React szakaszban készülnek el.

Kéréskorlátok: regisztráció 5/perc/IP; belépés 5/perc/e-mail+IP és 20/perc/IP; újraküldés 3/perc/fiók; megerősítő link 20/perc/IP. Túllépéskor 429. Hibás belépésnél egységes hibaüzenet jár létező és ismeretlen e-mailre is. Az API `Accept` fejléc nélkül is JSON-választ ad.

2026-11-16: **52 teszt, 306 assertion sikeres**, Pint, Compose és whitespace-ellenőrzés rendben. A tesztek a külön `testing` MySQL-adatbázison futnak. A regisztráció–Mailpit–megerősítés–védett végpont–kijelentkezés folyamatot az Nginxen keresztül is igazoltuk. A megjelölt helyi tesztfelhasználó #1 megmaradt; a teszt végén a tokenjét visszavontuk. Valódi SMTP és frontend továbbra is későbbi feladat.

A folyamatnapló és a HTML-terv verziózott másolatai a `docs/` mappába kerülnek. A `portfolio/` mappában található, eddig használt példányokat ugyanazzal a tartalommal tartjuk naprakészen.

## Demó és 5 használatos keret (5. szakasz)

**Kód és automatikus tesztek kész; az élő Claude-próbát a felhasználó kérésére későbbre hagytuk.** Az Anthropic-kulcs és a modell még nincs beállítva. Ilyenkor a demó 503-at ad, a keret változatlan. Fizetős próbahívás nem történt; az AI-válaszokat kizárólag a tesztek szimulálják, nincs helyi ál-eredményt kiadó alkalmazásmód.

A backend könyvtárában:

```bash
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan test
```

| Végpont | Feltételek | Eredmény |
|---|---|---|
| `POST /api/v1/demo` | Sanctum bearer token, megerősített e-mail, 10–3000 karakteres `prompt`, UUID `Idempotency-Key` fejléc | Új eredmény: 201; azonos kérés ismétlése: 200 |
| `GET /api/v1/demo/{id}` | megerősített tulajdonos bearer tokenje | 200; más fiókhoz tartozó/nem létező eredmény: 404 |
| `POST /api/v1/inquiries` | opcionális `demo_session_id`; ha van, megerősített tulajdonos bearer tokenje kell | az ajánlathoz mentett demókapcsolat |

Példakérés az élő integráció későbbi bekapcsolása után (szolgáltatói költséggel és siker esetén egy demóhasználat fogyasztásával):

```http
POST /api/v1/demo
Authorization: Bearer <token>
Idempotency-Key: 38f44f36-3d7b-4adf-a7ad-2a7bec93d0fd
Content-Type: application/json

{"prompt":"Sok telefonos időpontegyeztetésem van, ezt szeretném egyszerűsíteni."}
```

A válasz `data` része: `id`, `prompt`, `result.summary`, `result.recommendation`, `created_at`; POST esetén a `meta.demo_uses_left` a megmaradt keret. Egy felhasználónak összesen 5 sikeres eredmény engedélyezett. A hatodik új kérés 403: `code=demo_quota_exhausted`, ajánlatkérésre irányító üzenettel és `inquiry_url` mezővel. Belépés, napváltás vagy sikertelen kérés nem tölti újra a keretet. A végpont korlátja 10 kérés/perc/fiók.

A `DemoService` a felhasználó MySQL-sorát `lockForUpdate()` zárral védi a szolgáltatói kérés alatt is. Az eredmény mentése és a számláló csökkentése egy tranzakció. Ha a szolgáltatói hívás, a kimenetellenőrzés vagy a mentés hibás, nincs keretfogyasztás. Zárvárakozási időtúllépés/holtpont esetén 503-as, újrapróbálható válasz jár; a tranzakciót automatikusan nem ismételjük meg, hogy ne ismételjünk fizetős hívást.

Az idempotenciakulcs fiókonként egyedi. Sikeresen mentett kérés ugyanazzal a kulccsal és szöveggel visszaolvasható új szolgáltatói hívás és új keretfogyasztás nélkül, nulla megmaradt keretnél is. Azonos kulcs más szöveggel 409. Sikertelen, nem mentett kérés később azonos kulccsal újrapróbálható. Folyamatleállás vagy hálózati hiba esetén az alkalmazás és a külső API között nincs elosztott tranzakció: a szolgáltató feldolgozhat egy olyan hívást is, amelynek eredményét már nem tudtuk menteni. A felhasználói keret ilyenkor változatlan, de szolgáltatói költség keletkezhet.

A Claude-kliens Laravel HTTP-klienssel a fix HTTPS Messages API-t hívja; az API-kulcs csak szerveroldali fejléc. Az API-verzió rögzített (`2023-06-01`), a modell környezeti beállítás. A JSON-sémában `summary` és `recommendation` kötelező; a kész JSON-t külön típus- és hosszellenőrzés is védi. Max. 1024 kimeneti token, 5 másodperc kapcsolódási és 25 másodperc teljes timeout; nincs automatikus HTTP-újrapróbálkozás és átirányításkövetés. Nyers szolgáltatói hibát és kulcsot nem adunk vissza. Félbeszakadt vagy hibás eredmény 502, szolgáltatói/konfigurációs hiba 503.

Hivatalos referenciák: [strukturált JSON-kimenet](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [API-verziózás](https://platform.claude.com/docs/en/api/versioning).

Az élő próba később: `backend/.env` fájlban `ANTHROPIC_API_KEY` és strukturált kimenetet támogató `ANTHROPIC_MODEL` beállítása, majd `./vendor/bin/sail artisan config:clear`. A kulcsot ne másold a chatbe, frontendbe vagy Gitbe. A `.env.example` csak üres helyőrzőket tartalmaz. A modellhez való hozzáférést és az aktuális díjazást az élő próba előtt ellenőrizni kell.

2026-11-16: **89 teszt, 484 assertion sikeres**, Pint és whitespace-ellenőrzés rendben; a helyi migrációk lefutottak. Valós MySQL-zárakon, hat külön PHP-folyamattal teszteltük az utolsó használatért versenyző kéréseket és az azonos kulcsú párhuzamos ismétlést: mindkettőnél egyetlen szimulált szolgáltatói hívás és egyetlen mentés. Külön teszt igazolja a zárvárakozás lejáratát. Az eredmény-, jogosultsági és ajánlatkapcsolási tesztek is sikeresek.

Nginxen végzett próba: vendégként 401; megerősített helyi #2 tesztfiókkal, hiányzó Claude-konfiguráció mellett 503 és változatlan 5-ös keret. A teszttokent kijelentkezéssel visszavontuk. **Sikeres élő Claude-válasz és annak tartalmi minősége még nincs igazolva.**

## React frontend (6. szakasz)

A `frontend/` önálló React + Vite alkalmazás, React Routerrel és központi API-klienssel. Ellenőrzött környezet: Node 24.22.1, React 19.3.1, Vite 8.3.8. A `package-lock.json` rögzíti a telepített függőségeket. Az elfogadott főoldalminta mustársárga/petróleum, antracit/törtfehér irányát követi; a kártyák szemléltető grafikák, az esettanulmány nem valódi ügyfélreferencia. Nincs kitalált telefonszám, ügyfél vagy eredményszázalék.

### Első indítás és frissítés

A repository gyökeréből, **az Nginx indítása előtt**:

```bash
npm --prefix frontend ci
npm --prefix frontend run build
cd backend
./vendor/bin/sail up -d
```

Oldal: **http://localhost:8082/**. A `frontend/dist` generált és Gitből kizárt; az Nginx csak olvasható kötettel szolgálja ki. A `/api/` és `/up` továbbra is Laravelre kerül, a frontend útvonalai `index.html` fallbacket kapnak. A böngészőben közvetlenül megnyitott `/belepes`, `/ajanlat` és `/megerosites/...` is működik.

Frontend változtatás után `npm --prefix frontend run build`, majd böngészőfrissítés. Laravel queue-kód változtatása után `./vendor/bin/sail restart inquiry-worker` a backend mappából. Fejlesztéshez (HMR):

```bash
npm --prefix frontend run dev
```

A Vite címe `http://127.0.0.1:5174`; a `/api` proxyn keresztül a működő Nginx/Laravel `localhost:8082` címét használja. Ehhez a Docker környezetnek futnia kell. A dev szerver leállítása Ctrl+C. A kész helyi alkalmazás működéséhez nem kell dev szervert futtatni.

### Felhasználói utak

- `/`: főoldal, szolgáltatások, szemléltető koncepció és kapcsolatblokk.
- `/regisztracio`, `/belepes`: név/e-mail/jelszó, kliens- és szerveroldali hibák, küldés közbeni tiltás. Regisztráció után automatikus belépés, majd megerősítési kapu.
- `/megerosites/{user}/{hash}?expires=...&signature=...`: a levélben kapott, felhasználóbarát visszajelző oldal. A megerősítő gomb az eredeti aláírt `/api/v1/email/verify/...` útvonalat hívja; az aláírás és a 60 perces lejárat védelme megmarad. A korábbi, közvetlen API-linkek továbbra is érvényesek a lejáratukig. A felület nem jelentkeztet be a link megnyitásával.
- `/demo`: vendégként belépés/regisztráció; megerősítésig ellenőrzés és levél-újraküldés; megerősítve keret, szövegmező, elemzés, hibakezelés, eredmény és továbbvitel az ajánlatkérésbe. Nulla keretnél tiltott elemzés és ajánlatkérési lehetőség.
- `/ajanlat`: nyilvános űrlap; belépve név/e-mail előkitöltés. Demóból érkezve a saját eredmény leírása és azonosítója átkerül. Sikeres mentés után azonosítós visszaigazolás, ismételt küldés nélkül. Érvénytelen vagy sikertelen küldéskor a kitöltött mezők megmaradnak az oldalon.

A bearer token csak a React alkalmazás memóriájában él: nem kerül URL-be, localStorage-ba vagy sessionStorage-ba. Újratöltés, új lap vagy bezárás után újra be kell lépni. Az ajánlatpiszkozat sessionStorage-ban 60 percig megmarad; sikeres küldés, ürítés vagy kijelentkezés törli. A kijelentkezés megkísérli a szerveroldali visszavonást, majd törli a helyi munkamenetet; sikertelen hálózati lezárásról visszajelzést ad. A 401-es API-válasz törli a helyi hitelesítést. Teljes React-újratöltés önmagában nem vonja vissza a 24 óráig élő szerveroldali tokent.

A demókéréshez új szöveg esetén új UUID Idempotency-Key készül. Sikertelen/eldobott válasz utáni azonos szövegű újrapróbálkozás ugyanazt a kulcsot használja. A változatlan, már megjelenített eredményt nem indítjuk el még egyszer. Az előkitöltött ajánlathoz csak az aktuális megerősített tulajdonos demóazonosítója csatolódik.

### Nyilvános frontend-beállítások

A `frontend/.env.example` alapján létrehozható, Gitből kizárt `frontend/.env.local`:

```dotenv
VITE_CONTACT_PHONE=
VITE_BOOKING_URL=
VITE_DEMO_AVAILABLE=false
```

A telefon csak érvényes szám esetén kattintható; a foglaláshoz HTTPS URL szükséges, hiányában az ajánlatkérőre irányítunk. Ezek nyilvános, buildidejű értékek. **Anthropic- vagy más titkos kulcs soha nem kerülhet VITE_ változóba.**

A `VITE_DEMO_AVAILABLE` jelenleg szándékosan false: az élő AI-bekötés halasztva van. A felület ezt jelzi és nem indít demóhívást. Csak az 5. szakasz élő Claude-ellenőrzése után állítsd true-ra, majd készíts új buildet. Ez megjelenítési kapcsoló; a tényleges jogosultságot és kvótát mindig a backend ellenőrzi.

### Ellenőrzés

```bash
npm --prefix frontend test
npm --prefix frontend run build
# A backend/ mappában:
./vendor/bin/sail artisan test
```

Eredmény: **19 frontendteszt sikeres, 89 backendteszt / 484 assertion sikeres**; build, Pint, Nginx konfiguráció és whitespace rendben. A frontendtesztek a valódi React komponenseket és mockolt API-válaszokat használják: regisztráció, megerősítési kapu, aláírt link céloldala, hálózati/mezőhibák, függő küldés duplázásának tiltása, nulla keret, kikapcsolt demó, azonos idempotenciakulcsú újrapróbálkozás, előkitöltött ajánlat és kijelentkezés.

Valódi böngészős próba Nginxen: 1280-as asztali és 390-es mobilnézet; mobilos ajánlat mentése (#2) és Mailpit-visszaigazolása; helyi tesztfiók regisztrálása, levél megerősítése, 5/5 keret megjelenése, letiltott élő demó, kijelentkezés. A megjelölt helyi minták megmaradtak; a tesztfiókból kijelentkeztünk. Fizetős AI-hívás nem történt. A demó sikeres eredményből történő előkitöltése komponens- és backendteszttel igazolt; sikeres élő Claude-válasszal még nem.

Képernyőképek: [asztali főoldal](docs/preview/pixi-stage6-desktop.jpg), [mobil főoldal](docs/preview/pixi-stage6-mobile.jpg). Még hátravan: végleges kontaktadatok, saját referenciaanyagok és a külön designjóváhagyás, az élő AI-próba, éles SMTP, valamint a 8. szakasz teljes minőségellenőrzése/élesítése.

## Portfólió és esettanulmányok (7. szakasz)

A főoldalon beágyazott, a menüből külön is elérhető portfólió: `/portfolio`. Az első, felhasználó által kiválasztott saját projekt a Pixi weboldala: `/portfolio/pixi-weboldal`. Az esettanulmány szövege elkészült; a végső tartalmi jóváhagyás még nyitott.

A `frontend/src/data/portfolio.js` tartalmazza a strukturált projektadatokat. A közös `Portfolio` komponens szűri és megjeleníti őket, a `CaseStudy` oldal a slug alapján ugyanebből a forrásból épül. Új projekthez egyedi slug, cím, kategóriák, saját képernyőképek, probléma/megoldás/eredmény, ellenőrizhető bizonyíték és a még nyitott korlátok adhatók meg. Nem készítettünk külön adatbázist vagy adminfelületet a statikus tartalomhoz.

Kategóriák: összes, webfejlesztés, AI és automatizáció, design és UX/UI. A Pixi jelenleg a web/design kategóriákban szerepel; az élő AI-bekötés halasztása miatt nincs AI-referenciának feltüntetve. Üres kategóriánál érthető visszajelzés és visszaállító gomb jelenik meg. A szűrőgombok aria-pressed állapota és a találatszám élő státusza segíti a használatot. Egyetlen projekt kiemelt elrendezést, több projekt kétoszlopos listát kap; mobilon egy oszlop látszik.

Az első esettanulmány saját bemutatóprojektként, fejlesztés alatt álló helyi alkalmazásként jelöli a Pixit. Valódi, a 6. szakaszban készített asztali és mobilképernyőképet mutat. A tesztadatokat időponthoz/szakaszhoz kötve közli, és külön jelzi, hogy ezek fejlesztési bizonyítékok, nem üzleti eredmények. Nincs ügyfélnek tulajdonított munka, kitalált megtérülés vagy elkészültként feltüntetett élő AI-integráció.

Ellenőrzés: **26 frontendteszt sikeres**, Vite build és whitespace rendben. A tesztek a főoldali és menübeli elérést, a szűrőket és üres állapotot, a részletoldal tartalmát és címét, a közvetlen URL-t, az ismeretlen projektet és az adatszerződést is ellenőrzik. Egy korábbi kijelentkezési teszt célzását pontosítottuk, mert most már a találatszám is status szerepkörrel rendelkezik. Backendváltozás nem történt; a 6. szakaszban igazolt 89 backendteszt / 484 ellenőrzés eredménye változatlan előzmény.

Valódi böngészős ellenőrzés: szűrés és visszaállítás, részletoldal megnyitása, közvetlen oldalfrissítés, valamint 390 pixeles mobilnézet túlcsordulás nélkül. Képek: `docs/preview/pixi-stage7-portfolio.jpg` és `docs/preview/pixi-stage7-case-mobile.jpg`. Az élő AI továbbra is kikapcsolt; nyilvános élesítés nem történt. A következő tervezett szakasz a 8. szakasz minőségellenőrzése; a tartalmi és designjóváhagyás, végleges kontaktadatok és az éles szolgáltatások még hátravannak.

### Második projekt: School Management

A felhasználó kérésére a Pixi mellé felvettük a [school_management](https://github.com/Pixidev87/school_management) saját projektet. Elérés: `/portfolio/school-management`; a főoldalon és a portfóliólistában is szerepel, webfejlesztési kategóriában. A designszűrőben továbbra is csak a Pixi szerepel; az AI-kategóriában nincs igazolatlan AI-referencia.

A bemutató alapja a 2026-11-16-án olvasott [Laravel API-útvonaltérkép](https://github.com/Pixidev87/school_management/blob/main/school-management/routes/api.php), [React útvonaltérkép](https://github.com/Pixidev87/school_management/blob/main/school-management/resources/js/routes/AppRoutes.jsx), valamint a package.json és composer.json. A források diák-, tanár-, osztály-, tantárgy-, jelenléti, órarend-, vizsga-, díj-, könyvtári, közlekedési és értesítési modulokat, React/Bootstrap/React Query felületet, Laravel/Sanctum API-t és egyes műveleteknél szerepkör-ellenőrzést mutatnak. A projektet nem telepítettük és nem futtattuk; nincs új, igazolt tesztfutási vagy éles használati állítás.

Képernyőkép hiányában a `frontend/public/images/school-management.svg` saját, egyértelműen jelölt modultérképe került a kártyára és a részletoldalra. Ez nem az alkalmazás képernyőképe. A közös esettanulmány-sablon projektenként külön forráslinkeket, ellenőrzési megjegyzést, eredménycímet és opcionális mobilképet kezel; így a Pixi-specifikus bizonyítékok nem kerülnek át más projektre.

Ellenőrzés: **28 frontendteszt sikeres**, Vite build és whitespace rendben. Új tesztek védik a kétprojekt-listát, a kategóriánkénti találatszámot, a School Management saját GitHub-linkjét és a Pixi-specifikus tartalom hiányát az iskolai esettanulmányban. Valódi böngészős listanézet és részletoldal, 390 pixeles mobilnézet túlcsordulás nélkül. Backendváltozás és új backendteszt-futtatás nem történt. Képernyőkép: docs/preview/pixi-school-portfolio.jpg. A végső tartalmi/designjóváhagyás, az élő AI-próba és élesítés továbbra is nyitott.

## 2026-11-16 – 8. szakasz: helyi minőségellenőrzés és School Management képek

- Felhasználói döntés: kizárólag helyi minőségellenőrzés; élő Claude-próba és nyilvános élesítés nem történt.
- Korábbi ellenőrzési kör: 50 frontendteszt, 93 backendteszt / 511 assertion; Vite build és Pint sikeres. npm production audit és Composer audit nem jelzett ismert sérülékenységet.
- Ajánlatküldés: opcionális UUID Idempotency-Key, payload-ütközésre 409; hat párhuzamos azonos kérés egy ajánlatot és egy levélfeladatot eredményezett. Régi, kulcs nélküli kérések továbbra is új ajánlatot hoznak létre.
- Az ajánlatpiszkozat sessionStorage-ban, 60 perces élettartammal megmarad; sikeres küldés, ürítés vagy kijelentkezés törli. Token és jelszó nem kerül ide. Mobilos böngészőpróbán frissítés után visszaállt, elküldés után kiürült; Mailpitben egy visszaigazolás érkezett.
- Mobilmenü Escape bezárással és fókusz-visszaadással; olvashatóbb kis kiemelőszövegek, beviteli keretek és fókuszjelölések. Kilenc útvonal automatizált axe DOM-ellenőrzése és külön kontrasztszámítás; ez nem teljes WCAG-minősítés. Hálózati hibák komponensteszttel szimulálva, valós mobilhálózati teljesítménymérés nem történt.
- Nginx CSP, nosniff és Referrer-Policy fejlécek ellenőrizve. Éles proxy/IP-kezelés, HTTPS, SMTP, végleges kontaktadatok és szöveg/designjóváhagyás továbbra is nyitott. Ez helyi ellenőrzés, nem teljes biztonsági audit.
- School Management: a /Users/pixidev/Desktop/school/ képei megtekintve; áttekintő, osztályok és jelenlét felhasználásával modern Pixi-arculatú kollázs készült a beépített imagegen eszközzel. Fájl: frontend/public/images/school-management-showcase.png. A korábbi SVG helyett ezt használja a portfólió és a részletoldal. A képaláírás egyértelműen jelzi az AI-val szerkesztett összeállítást; nem állítunk független School Management futtatási vagy üzleti eredményt.
- Képgenerálási brief: fekvő modern portfóliókollázs, eredeti kék-fehér alkalmazásfelületek; törtfehér háttér, antracit cím, mustár/petrol hangsúlyok; fő áttekintő és két kiegészítő panel. Cím: School Management; alcím: Iskolai adminisztráció egy felületen. Kitalált rekordok és grafikonok nélkül.
- A 8. szakasz helyi ellenőrzési köre lezárható; teljes élesítési szakasz továbbra is részleges.
