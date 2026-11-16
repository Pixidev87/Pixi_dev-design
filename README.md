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
   ``

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
