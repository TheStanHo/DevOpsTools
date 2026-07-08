const encoder = new TextEncoder();

const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
};

const getElement = (id) => document.getElementById(id);

const writeOutput = (id, value, isError = false) => {
  const output = getElement(id);
  output.textContent = value;
  output.classList.toggle("error", isError);
};

const getOutputText = (id) => getElement(id).textContent.trim();

const getRandomCharacter = (characters) => {
  const randomValue = new Uint32Array(1);
  const maxValid = Math.floor(0xffffffff / characters.length) * characters.length;

  do {
    crypto.getRandomValues(randomValue);
  } while (randomValue[0] >= maxValid);

  return characters[randomValue[0] % characters.length];
};

const shuffleSecurely = (items) => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomValue = new Uint32Array(1);
    crypto.getRandomValues(randomValue);
    const swapIndex = randomValue[0] % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
};

const generatePassword = () => {
  const length = Number.parseInt(getElement("password-length").value, 10);
  const selectedSets = [
    ["include-uppercase", characterSets.uppercase],
    ["include-lowercase", characterSets.lowercase],
    ["include-numbers", characterSets.numbers],
    ["include-symbols", characterSets.symbols],
  ]
    .filter(([checkboxId]) => getElement(checkboxId).checked)
    .map(([, characters]) => characters);

  if (!Number.isInteger(length) || length < 8 || length > 128) {
    writeOutput("password-output", "Choose a length from 8 to 128 characters.", true);
    return;
  }

  if (selectedSets.length === 0) {
    writeOutput("password-output", "Select at least one character type.", true);
    return;
  }

  if (length < selectedSets.length) {
    writeOutput("password-output", "Length must fit all selected character types.", true);
    return;
  }

  const allCharacters = selectedSets.join("");
  const requiredCharacters = selectedSets.map((characters) => getRandomCharacter(characters));
  const remainingCharacters = Array.from({ length: length - requiredCharacters.length }, () =>
    getRandomCharacter(allCharacters)
  );

  writeOutput(
    "password-output",
    shuffleSecurely([...requiredCharacters, ...remainingCharacters]).join("")
  );
};

const encodeBase64 = () => {
  const input = getElement("base64-input").value;
  const binary = Array.from(encoder.encode(input), (byte) => String.fromCodePoint(byte)).join("");
  writeOutput("base64-output", btoa(binary));
};

const decodeBase64 = () => {
  try {
    const input = getElement("base64-input").value.trim();
    const binary = atob(input);
    const bytes = Uint8Array.from(binary, (character) => character.codePointAt(0));
    writeOutput("base64-output", new TextDecoder().decode(bytes));
  } catch {
    writeOutput("base64-output", "Input is not valid Base64.", true);
  }
};

const generateHash = async () => {
  const input = getElement("hash-input").value;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
  writeOutput("hash-output", hash);
};

const generateUuid = () => {
  writeOutput("uuid-output", crypto.randomUUID());
};

const formatJson = (space) => {
  try {
    const parsed = JSON.parse(getElement("json-input").value);
    writeOutput("json-output", JSON.stringify(parsed, null, space));
  } catch (error) {
    writeOutput("json-output", `Invalid JSON: ${error.message}`, true);
  }
};

const convertTimestamp = () => {
  const input = getElement("timestamp-input").value.trim();

  if (!input) {
    writeOutput("timestamp-output", "Enter a Unix timestamp or ISO date.", true);
    return;
  }

  const numericValue = Number(input);
  const date = Number.isFinite(numericValue)
    ? new Date((input.length <= 10 ? numericValue * 1000 : numericValue))
    : new Date(input);

  if (Number.isNaN(date.getTime())) {
    writeOutput("timestamp-output", "Could not parse that timestamp or date.", true);
    return;
  }

  writeOutput(
    "timestamp-output",
    [
      `Unix seconds: ${Math.floor(date.getTime() / 1000)}`,
      `Unix milliseconds: ${date.getTime()}`,
      `UTC: ${date.toISOString()}`,
      `Local: ${date.toLocaleString()}`,
    ].join("\n")
  );
};

const useCurrentTimestamp = () => {
  getElement("timestamp-input").value = Math.floor(Date.now() / 1000).toString();
  convertTimestamp();
};

const encodeUrl = () => {
  writeOutput("url-output", encodeURIComponent(getElement("url-input").value));
};

const decodeUrl = () => {
  try {
    writeOutput("url-output", decodeURIComponent(getElement("url-input").value));
  } catch {
    writeOutput("url-output", "Input is not valid URL-encoded text.", true);
  }
};

const copyOutput = async (targetId, button) => {
  const text = getOutputText(targetId);

  if (!text) {
    return;
  }

  await navigator.clipboard.writeText(text);
  const originalText = button.textContent;
  button.textContent = "Copied";
  window.setTimeout(() => {
    button.textContent = originalText;
  }, 1400);
};

getElement("generate-password").addEventListener("click", generatePassword);
getElement("base64-encode").addEventListener("click", encodeBase64);
getElement("base64-decode").addEventListener("click", decodeBase64);
getElement("hash-generate").addEventListener("click", generateHash);
getElement("uuid-generate").addEventListener("click", generateUuid);
getElement("json-format").addEventListener("click", () => formatJson(2));
getElement("json-minify").addEventListener("click", () => formatJson(0));
getElement("timestamp-convert").addEventListener("click", convertTimestamp);
getElement("timestamp-now").addEventListener("click", useCurrentTimestamp);
getElement("url-encode").addEventListener("click", encodeUrl);
getElement("url-decode").addEventListener("click", decodeUrl);

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => copyOutput(button.dataset.copyTarget, button));
});

generatePassword();
generateUuid();
useCurrentTimestamp();
