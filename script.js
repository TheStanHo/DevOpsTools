const encoder = new TextEncoder();

const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
};

const cronAliases = {
  month: {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  },
  weekday: {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  },
};

const cronFieldConfigs = [
  { label: "Minute", max: 59, min: 0 },
  { label: "Hour", max: 23, min: 0 },
  { label: "Day of month", max: 31, min: 1 },
  { aliases: cronAliases.month, label: "Month", max: 12, min: 1 },
  { aliases: cronAliases.weekday, allowSevenAsSunday: true, label: "Day of week", max: 7, min: 0 },
];

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

const parseCronValue = (rawValue, config) => {
  const normalizedValue = rawValue.toLowerCase();
  const aliasValue = config.aliases?.[normalizedValue];
  const parsedValue = aliasValue ?? Number.parseInt(normalizedValue, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < config.min || parsedValue > config.max) {
    throw new Error(`${config.label} value "${rawValue}" is outside ${config.min}-${config.max}.`);
  }

  if (config.allowSevenAsSunday && parsedValue === 7) {
    return 0;
  }

  return parsedValue;
};

const parseCronField = (field, config) => {
  const values = new Set();
  const parts = field.toLowerCase().split(",");
  const isWildcard = field === "*";

  for (const part of parts) {
    if (!part) {
      throw new Error(`${config.label} has an empty list item.`);
    }

    const [rangePart, stepPart] = part.split("/");
    const step = stepPart === undefined ? 1 : Number.parseInt(stepPart, 10);

    if (!Number.isInteger(step) || step < 1) {
      throw new Error(`${config.label} step must be a positive number.`);
    }

    let start = config.min;
    let end = config.max;

    if (rangePart !== "*") {
      if (rangePart.includes("-")) {
        const [rawStart, rawEnd] = rangePart.split("-");
        start = parseCronValue(rawStart, config);
        end = parseCronValue(rawEnd, config);

        if (config.allowSevenAsSunday && rawEnd.toLowerCase() === "sun" && start > 0) {
          end = 7;
        }
      } else {
        start = parseCronValue(rangePart, config);
        end = stepPart === undefined ? start : config.max;
      }
    }

    if (start > end) {
      throw new Error(`${config.label} range "${rangePart}" must start before it ends.`);
    }

    for (let value = start; value <= end; value += step) {
      values.add(config.allowSevenAsSunday && value === 7 ? 0 : value);
    }
  }

  return { isWildcard, values };
};

const formatCronValues = (parsedField, config) => {
  if (parsedField.isWildcard) {
    return "any";
  }

  return [...parsedField.values].sort((first, second) => first - second).join(", ");
};

const parseCronExpression = (expression) => {
  const fields = expression.trim().split(/\s+/);

  if (fields.length !== 5) {
    throw new Error("Use exactly 5 fields: minute hour day-of-month month day-of-week.");
  }

  return fields.map((field, index) => parseCronField(field, cronFieldConfigs[index]));
};

const dateMatchesCron = (date, parsedFields) => {
  const [minutes, hours, daysOfMonth, months, daysOfWeek] = parsedFields;
  const dayOfMonthMatches = daysOfMonth.values.has(date.getUTCDate());
  const dayOfWeekMatches = daysOfWeek.values.has(date.getUTCDay());
  const dayMatches =
    daysOfMonth.isWildcard || daysOfWeek.isWildcard
      ? dayOfMonthMatches && dayOfWeekMatches
      : dayOfMonthMatches || dayOfWeekMatches;

  return (
    minutes.values.has(date.getUTCMinutes()) &&
    hours.values.has(date.getUTCHours()) &&
    months.values.has(date.getUTCMonth() + 1) &&
    dayMatches
  );
};

const getNextCronRuns = (parsedFields, limit = 5) => {
  const runs = [];
  const cursor = new Date();
  cursor.setUTCSeconds(0, 0);
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);

  const endTime = cursor.getTime() + 366 * 24 * 60 * 60 * 1000;

  while (runs.length < limit && cursor.getTime() <= endTime) {
    if (dateMatchesCron(cursor, parsedFields)) {
      runs.push(new Date(cursor));
    }

    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }

  if (runs.length === 0) {
    throw new Error("No matching run time found in the next year.");
  }

  return runs;
};

const explainCron = () => {
  try {
    const expression = getElement("cron-input").value;
    const parsedFields = parseCronExpression(expression);
    const fieldSummary = parsedFields
      .map((field, index) => `${cronFieldConfigs[index].label}: ${formatCronValues(field, cronFieldConfigs[index])}`)
      .join("\n");
    const nextRuns = getNextCronRuns(parsedFields)
      .map((date) => date.toISOString().replace(".000Z", "Z"))
      .join("\n");

    writeOutput(
      "cron-output",
      [`Expression: ${expression.trim()}`, fieldSummary, "Next 5 runs (UTC):", nextRuns].join("\n\n")
    );
  } catch (error) {
    writeOutput("cron-output", error.message, true);
  }
};

const applyCronPreset = (expression) => {
  getElement("cron-input").value = expression;
  explainCron();
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
getElement("cron-explain").addEventListener("click", explainCron);
getElement("url-encode").addEventListener("click", encodeUrl);
getElement("url-decode").addEventListener("click", decodeUrl);

document.querySelectorAll("[data-cron-preset]").forEach((button) => {
  button.addEventListener("click", () => applyCronPreset(button.dataset.cronPreset));
});

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => copyOutput(button.dataset.copyTarget, button));
});

generatePassword();
generateUuid();
useCurrentTimestamp();
explainCron();
