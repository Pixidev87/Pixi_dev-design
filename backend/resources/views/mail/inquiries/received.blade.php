<!DOCTYPE html>
<html lang="hu">
<head><meta charset="utf-8"><title>Ajánlatkérés visszaigazolása</title></head>
<body>
    <h1>Köszönjük az ajánlatkérésed!</h1>
    <p>Kedves {{ $inquiry->name }}!</p>
    <p>Megkaptuk az üzenetedet. Hamarosan felvesszük veled a kapcsolatot.</p>
    <p>Az ajánlatkérés azonosítója: {{ $inquiry->id }}</p>
    <p>Üdvözlettel,<br>Pixi web &amp; webdesign</p>
</body>
</html>
