export class ApiError extends Error {
  constructor(status, data = {}) {
    const messages = {
      0: "Nem sikerült kapcsolódni. Ellenőrizd az internetkapcsolatod, majd próbáld újra.",
      401: "A munkameneted lejárt. Jelentkezz be újra.",
      403:
        data.code === "demo_quota_exhausted"
          ? "Elfogyott az 5 demóhasználatod. Folytassuk egy személyre szabott ajánlattal!"
          : "Ehhez megerősített e-mail-cím és megfelelő hozzáférés szükséges.",
      409: "Ez a kérés már másik szöveghez tartozik. Módosítsd a leírást, és próbáld újra.",
      422: "Ellenőrizd a megjelölt mezőket.",
      429: "Most túl sok kérés érkezett. Várj egy percet, és próbáld újra.",
      502: "A válasz nem volt feldolgozható. Próbáld újra később.",
      503: "A szolgáltatás átmenetileg nem érhető el. Próbáld újra később.",
    };
    super(messages[status] ?? "Átmeneti hiba történt. Próbáld újra később.");
    this.status = status;
    this.code = data.code;
    this.fields =
      data.errors && typeof data.errors === "object" ? data.errors : {};
  }
}

export async function request(
  path,
  { method = "GET", data, token, idempotencyKey } = {},
) {
  const headers = { Accept: "application/json" };
  if (data !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  let response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      headers,
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: AbortSignal.timeout(35000),
    });
  } catch {
    throw new ApiError(0);
  }
  if (response.status === 204) return null;
  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(502);
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new ApiError(502);
  if (!response.ok) throw new ApiError(response.status, body);
  return body;
}
