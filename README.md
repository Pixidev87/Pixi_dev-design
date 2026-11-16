# Pixi web & webdesign

A Pixi web & webdesign közös vállalkozás bemutatkozó és portfólióoldala. A projekt célja, hogy egy helyen mutassa be a webfejlesztési, AI- és automatizációs, valamint grafikai és UX/UI szolgáltatásokat, és egyszerű ajánlatkéréssel kapcsolja össze az érdeklődőket a csapattal.

## Projektállapot

A Laravel 13.42.0 alapalkalmazás Sail környezetben elindult. A MySQL és Redis szolgáltatások működnek, az alap Laravel migrációk lefutottak. Az első, görgethető főoldal jelenleg külön design prototípusként készült el; a végleges React frontend és a backendhez kapcsolása későbbi lépés.

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

A `POST /api/v1/inquiries` nyilvános végpont kötelező mezői: `name` (legfeljebb 150 karakter), `email` (RFC szerinti e-mail, legfeljebb 254 karakter), `description` (legfeljebb 5000 karakter). A szövegek szélén lévő szóközöket a Laravel eltávolítja. Az állapotot a szerver `new` értékre állítja; a kliens által megadott állapot és a még nem támogatott demóazonosító 422-es hibát ad. A `demo_session_id` nullable mező előkészítés: a külső kulcs és a tulajdonos ellenőrzése a demó szakaszában készül el.

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

Az ajánlat és a visszaigazoló Mailable feladata ugyanabba az adatbázis-tranzakcióba kerül. Az `inquiry-mail` kapcsolat az alkalmazás adatbázisát és a meglévő `jobs` táblát használja. A külön Docker worker ezt a sort olvassa, legfeljebb három próbálkozással (30, majd 120 másodperc várakozás); SMTP-hiba nem törli az ajánlatot. A 201 a mentést és a küldés sorba állítását jelenti. A kézbesítés legalább egyszeri: ritka megszakadásnál ismételt levél előfordulhat. Ismételt POST új ajánlatot hoz létre.

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
