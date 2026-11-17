# Pixi – indulási lista

Frissítve: 2026-11-17. Jelenlegi kör: helyi előkészítés. Nyilvános telepítés és fizetős AI-hívás nincs engedélyezve ebben a körben.

## Megismételhető helyi ellenőrzés

A repository gyökeréből, telepített frontendfüggőségekkel és futó helyi Sail környezettel:

```bash
bash scripts/check-local.sh
```

Az első hibánál leáll. Sorrend: frontendtesztek, frontend build, backendtesztek, whitespace, valamint a külső napló-/HTML-példányok egyezése, ha azok jelen vannak. A backendtesztek a projekt tesztadatbázisát használják; ezt a parancsot helyi fejlesztői környezetben futtasd. Nem telepít függőséget, nem indít szolgáltatást és nem végez éles migrációt.

## Indulás előtt eldöntendő

| Feladat | Jelenlegi állapot | Elfogadási feltétel |
| --- | --- | --- |
| Domain és tárhely | Nincs kiválasztva | Végleges HTTPS cím, futtatási környezet és hozzáférés ismert |
| Tartalom és design | Végső jóváhagyás nyitott | Főoldal, két esettanulmány, mobilnézet és kollázs elfogadva |
| Kontaktadatok | Nem véglegesek | Telefon, foglalási link és elérhetőségek ellenőrizve |
| Adatkezelési tájékoztatás | Indulás előtt rendezendő | Ajánlatkérés és fiókadatok tárolási/törlési folyamata meghatározva, megfelelő tájékoztatás elérhető |
| Éles levélküldés | Mailpit csak helyben | Saját SMTP, feladó és domainhitelesítés, megerősítés és visszaigazolás kézbesítve |
| Élő AI-demó | Felhasználói döntés szerint halasztva | Kikapcsolva is indulhat; bekapcsolás előtt élő siker/hiba/kvóta ellenőrzés szükséges |

## Tárhelyválasztás után

- [ ] Éles környezeti értékek a szerveren: APP_ENV=production, APP_DEBUG=false, megfelelő APP_URL, saját APP_KEY, adatbázis és levélküldés. Titkok nem kerülnek Gitbe vagy VITE_ változóba.
- [ ] HTTPS, proxybizalom és valódi kliens-IP/rate limit ellenőrzése a konkrét hálózati felépítésben.
- [ ] MySQL/Redis és belső adminfelületek hálózati hozzáférésének korlátozása; a fejlesztői Compose nem kész éles telepítési terv.
- [ ] Adatbázismentés és visszaállítás kipróbálva; kiadás előtt visszaállítási terv, migrációs hatások átnézve. Adatvesztő rollback nem automatikus.
- [ ] Queue worker felügyelet, hibás feladatok és naplózás ellenőrizve; SMTP-hiba után a feladat újrapróbálható.
- [ ] Verzióhoz kötött frontend build, Laravel konfiguráció/cache és szükséges írási jogosultságok ellenőrizve.
- [ ] Éles URL-en közvetlen portfólió-mélylink, regisztráció, megerősítő link, ajánlat és levélküldés végigpróbálva.
- [ ] Mobilos billentyűzet/fókusz, kézi akadálymentesség és lassú hálózat ellenőrizve; az automatizált DOM-tesztek ezeket nem fedik le teljesen.

A nyitott döntések rögzítése után a konkrét tárhelyhez készíthető telepítési és visszaállítási eljárás.
