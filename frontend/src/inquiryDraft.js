const KEY = "pixi:inquiry-draft:v1";
const LIFETIME = 60 * 60 * 1000;
export function clearInquiryDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* Storage may be unavailable. */
  }
}
export function loadInquiryDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (
      !draft ||
      !Number.isFinite(draft.expires) ||
      draft.expires < Date.now() ||
      !draft.form ||
      !["name", "email", "description"].every(
        (key) => typeof draft.form[key] === "string",
      ) ||
      draft.form.name.length > 150 ||
      draft.form.email.length > 254 ||
      draft.form.description.length > 5000
    ) {
      clearInquiryDraft();
      return null;
    }
    return draft;
  } catch {
    clearInquiryDraft();
    return null;
  }
}
export function saveInquiryDraft(form, pending, metadata) {
  try {
    if (!Object.values(form).some((value) => value.trim())) {
      clearInquiryDraft();
      return;
    }
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        form,
        pending,
        metadata,
        expires: Date.now() + LIFETIME,
      }),
    );
  } catch {
    /* The current form remains usable without storage. */
  }
}
