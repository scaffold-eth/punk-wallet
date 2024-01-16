export const copy = async (text, message) => {
  let copySuccessful = false;

  try {
    await navigator.clipboard.writeText(text);
    copySuccessful = true;
  } catch (error) {
    console.error("navigator.clipboard.writeText is not supported by your browser", error);
  }

  if (!copySuccessful) {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  if (message) {
    message();
  }
};
