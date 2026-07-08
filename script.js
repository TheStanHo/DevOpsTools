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

const httpStatusReasons = {
  100: "Continue",
  101: "Switching Protocols",
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  410: "Gone",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

const httpClassHints = {
  1: "Informational: the request is still being processed.",
  2: "Success: the request completed successfully.",
  3: "Redirect: the client should use another cached or provided location.",
  4: "Client error: check request syntax, authentication, authorization, or resource state.",
  5: "Server error: inspect upstream health, logs, dependencies, and retry behavior.",
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

const validateYaml = () => {
  const input = getElement("yaml-input").value;
  const lines = input.split("\n");
  const issues = [];
  const stack = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (line.includes("\t")) {
      issues.push(`Line ${lineNumber}: use spaces instead of tabs.`);
    }

    if (line.endsWith(" ")) {
      issues.push(`Line ${lineNumber}: remove trailing spaces.`);
    }

    if (!trimmed || trimmed.startsWith("#") || trimmed === "---" || trimmed === "...") {
      return;
    }

    const indent = line.match(/^ */)[0].length;
    if (indent % 2 !== 0) {
      issues.push(`Line ${lineNumber}: indentation is ${indent} spaces; 2-space indentation is easier to maintain.`);
    }

    for (const character of trimmed) {
      if ("[{(".includes(character)) {
        stack.push({ character, lineNumber });
      }

      if ("]})".includes(character)) {
        const previous = stack.pop();
        const pairs = { "(": ")", "[": "]", "{": "}" };
        if (!previous || pairs[previous.character] !== character) {
          issues.push(`Line ${lineNumber}: unmatched "${character}".`);
          break;
        }
      }
    }

    const isListItem = trimmed.startsWith("- ");
    const hasKeyValue = /^[\w"'.-][^:#]*:\s*($|.+)/.test(trimmed);
    const isBlockValue = /^[\w"'.-][^:#]*:\s*[>|]-?$/.test(trimmed);

    if (!isListItem && !hasKeyValue && !isBlockValue) {
      issues.push(`Line ${lineNumber}: expected a list item or key: value pair.`);
    }
  });

  if (stack.length > 0) {
    const lastOpen = stack[stack.length - 1];
    issues.push(`Line ${lastOpen.lineNumber}: unmatched "${lastOpen.character}".`);
  }

  writeOutput(
    "yaml-output",
    issues.length === 0
      ? "No obvious YAML issues found. Note: this is a lightweight browser lint, not a full YAML parser."
      : issues.join("\n"),
    issues.length > 0
  );
};

const cleanYaml = () => {
  const cleaned = getElement("yaml-input")
    .value.split("\n")
    .map((line) => line.replace(/\t/g, "  ").replace(/\s+$/g, ""))
    .join("\n")
    .trim();

  writeOutput("yaml-output", cleaned || "Nothing to clean.");
};

const decodeBase64Url = (value) => {
  const paddedValue = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const binary = atob(paddedValue.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binary, (character) => character.codePointAt(0));
  return new TextDecoder().decode(bytes);
};

const formatJwtDate = (value) => {
  if (!Number.isFinite(value)) {
    return "not present";
  }

  return `${value} (${new Date(value * 1000).toISOString()})`;
};

const decodeJwt = () => {
  try {
    const token = getElement("jwt-input").value.trim();
    const parts = token.split(".");

    if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
      throw new Error("JWT must have header, payload, and signature parts.");
    }

    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));

    writeOutput(
      "jwt-output",
      [
        "Header:",
        JSON.stringify(header, null, 2),
        "",
        "Payload:",
        JSON.stringify(payload, null, 2),
        "",
        `Issued at: ${formatJwtDate(payload.iat)}`,
        `Not before: ${formatJwtDate(payload.nbf)}`,
        `Expires: ${formatJwtDate(payload.exp)}`,
        `Signature bytes: ${Math.floor((parts[2].length * 3) / 4)}`,
        "",
        "Decoded only. Signature verification requires the issuer secret or public key.",
      ].join("\n")
    );
  } catch (error) {
    writeOutput("jwt-output", `Could not decode JWT: ${error.message}`, true);
  }
};

const ipToNumber = (ipAddress) => {
  const octets = ipAddress.split(".").map((part) => Number.parseInt(part, 10));

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    throw new Error("Enter a valid IPv4 address.");
  }

  return octets.reduce((result, octet) => ((result << 8) | octet) >>> 0, 0);
};

const numberToIp = (value) =>
  [24, 16, 8, 0].map((shift) => ((value >>> shift) & 255).toString()).join(".");

const calculateCidr = () => {
  try {
    const [ipAddress, rawPrefix] = getElement("cidr-input").value.trim().split("/");
    const prefix = Number.parseInt(rawPrefix, 10);

    if (!ipAddress || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
      throw new Error("Use IPv4 CIDR format like 10.0.12.34/24.");
    }

    const ipNumber = ipToNumber(ipAddress);
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const network = (ipNumber & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const totalAddresses = 2 ** (32 - prefix);
    const usableHosts = prefix >= 31 ? totalAddresses : Math.max(totalAddresses - 2, 0);
    const firstUsable = prefix >= 31 ? network : network + 1;
    const lastUsable = prefix >= 31 ? broadcast : broadcast - 1;

    writeOutput(
      "cidr-output",
      [
        `Network: ${numberToIp(network)}/${prefix}`,
        `Subnet mask: ${numberToIp(mask)}`,
        `Wildcard mask: ${numberToIp((~mask) >>> 0)}`,
        `Broadcast: ${numberToIp(broadcast)}`,
        `First usable: ${numberToIp(firstUsable)}`,
        `Last usable: ${numberToIp(lastUsable)}`,
        `Total addresses: ${totalAddresses.toLocaleString()}`,
        `Usable hosts: ${usableHosts.toLocaleString()}`,
      ].join("\n")
    );
  } catch (error) {
    writeOutput("cidr-output", error.message, true);
  }
};

const testRegex = () => {
  try {
    const pattern = getElement("regex-pattern").value;
    const flags = getElement("regex-flags").value;
    const text = getElement("regex-input").value;
    const uniqueFlags = [...new Set(flags.split(""))].join("");
    const matchFlags = uniqueFlags.includes("g") ? uniqueFlags : `${uniqueFlags}g`;
    const expression = new RegExp(pattern, matchFlags);
    const matches = [];
    let match = expression.exec(text);

    while (match && matches.length < 50) {
      matches.push(
        [`Match ${matches.length + 1}: "${match[0]}" at index ${match.index}`, ...match.slice(1).map((group, index) => `  Group ${index + 1}: ${group ?? ""}`)].join("\n")
      );

      if (match[0] === "") {
        expression.lastIndex += 1;
      }

      match = expression.exec(text);
    }

    writeOutput("regex-output", matches.length === 0 ? "No matches found." : matches.join("\n\n"));
  } catch (error) {
    writeOutput("regex-output", `Invalid regex: ${error.message}`, true);
  }
};

const buildLineDiff = (oldText, newText) => {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const table = Array.from({ length: oldLines.length + 1 }, () =>
    Array.from({ length: newLines.length + 1 }, () => 0)
  );

  for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
    for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
      table[oldIndex][newIndex] =
        oldLines[oldIndex] === newLines[newIndex]
          ? table[oldIndex + 1][newIndex + 1] + 1
          : Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1]);
    }
  }

  const diff = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length && newIndex < newLines.length) {
    if (oldLines[oldIndex] === newLines[newIndex]) {
      diff.push(`  ${oldLines[oldIndex]}`);
      oldIndex += 1;
      newIndex += 1;
    } else if (table[oldIndex + 1][newIndex] >= table[oldIndex][newIndex + 1]) {
      diff.push(`- ${oldLines[oldIndex]}`);
      oldIndex += 1;
    } else {
      diff.push(`+ ${newLines[newIndex]}`);
      newIndex += 1;
    }
  }

  while (oldIndex < oldLines.length) {
    diff.push(`- ${oldLines[oldIndex]}`);
    oldIndex += 1;
  }

  while (newIndex < newLines.length) {
    diff.push(`+ ${newLines[newIndex]}`);
    newIndex += 1;
  }

  return diff.join("\n");
};

const compareText = () => {
  const oldText = getElement("diff-old").value;
  const newText = getElement("diff-new").value;
  const diff = buildLineDiff(oldText, newText);

  writeOutput("diff-output", diff.trim() ? diff : "No differences found.");
};

const explainHttp = () => {
  const code = Number.parseInt(getElement("http-status").value, 10);
  const headerLine = getElement("http-header").value.trim();

  if (!Number.isInteger(code) || code < 100 || code > 599) {
    writeOutput("http-output", "Enter an HTTP status code from 100 to 599.", true);
    return;
  }

  const statusClass = Math.floor(code / 100);
  const headerParts = headerLine.split(":");
  const headerName = headerParts.shift()?.trim().toLowerCase();
  const headerValue = headerParts.join(":").trim();
  const headerSummary =
    headerName && headerValue
      ? `Header: ${headerName}\nValue: ${headerValue}\nTip: ${getHeaderTip(headerName)}`
      : "Header: enter a line like cache-control: no-store for guidance.";

  writeOutput(
    "http-output",
    [
      `Status: ${code} ${httpStatusReasons[code] ?? "Unknown status"}`,
      `Class: ${httpClassHints[statusClass] ?? "Unknown HTTP status class."}`,
      "",
      headerSummary,
    ].join("\n")
  );
};

const getHeaderTip = (headerName) => {
  const tips = {
    "cache-control": "Controls browser and proxy caching. Use no-store for sensitive responses.",
    authorization: "Carries credentials. Avoid logging this header.",
    "content-type": "Tells clients how to parse the response body.",
    location: "Used with redirects and created resources.",
    "retry-after": "Tells clients when to retry after 429 or 503 responses.",
    "strict-transport-security": "Forces future HTTPS connections when sent over HTTPS.",
    "x-forwarded-for": "Tracks original client IP through proxies; trust only from known proxies.",
  };

  return tips[headerName] ?? "Check casing, proxy behavior, and whether this header is request-only or response-only.";
};

const copyOutput = async (targetId, button) => {
  const text = getOutputText(targetId);

  if (!text) {
    return;
  }

  const originalText = button.textContent;

  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Copy failed";
  }

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
getElement("yaml-validate").addEventListener("click", validateYaml);
getElement("yaml-clean").addEventListener("click", cleanYaml);
getElement("jwt-decode").addEventListener("click", decodeJwt);
getElement("cidr-calculate").addEventListener("click", calculateCidr);
getElement("regex-test").addEventListener("click", testRegex);
getElement("diff-compare").addEventListener("click", compareText);
getElement("http-explain").addEventListener("click", explainHttp);

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
calculateCidr();
explainHttp();
