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

const cronFieldConfigsFive = [
  { label: "Minute", max: 59, min: 0 },
  { label: "Hour", max: 23, min: 0 },
  { label: "Day of month", max: 31, min: 1 },
  { aliases: cronAliases.month, label: "Month", max: 12, min: 1 },
  { aliases: cronAliases.weekday, allowSevenAsSunday: true, label: "Day of week", max: 7, min: 0 },
];

const cronFieldConfigsSix = [
  { label: "Second", max: 59, min: 0 },
  ...cronFieldConfigsFive,
];

const httpStatusReasons = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Content Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Content",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};

const httpClassHints = {
  1: "Informational: the request is still being processed.",
  2: "Success: the request completed successfully.",
  3: "Redirect: the client should use another cached or provided location.",
  4: "Client error: check request syntax, authentication, authorization, or resource state.",
  5: "Server error: inspect upstream health, logs, dependencies, and retry behavior.",
};

const samples = {
  base64: "DevOps Tools — local utilities",
  hash: "checksum-me-please",
  json: '{\n  "service": "api",\n  "replicas": 3,\n  "env": ["prod", "staging"]\n}',
  url: "https://example.com/search?q=devops tools&sort=asc",
  query: "service=api&replicas=3&tag=prod&tag=eu",
  yaml: "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\n  namespace: default\ndata:\n  LOG_LEVEL: info\n  FEATURE_FLAG: \"true\"\n",
  jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldk9wcyBUb29scyIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODkzNDU2MDAwfQ.signature",
  cidr: "2001:db8:abcd::/48",
  cli: "kubectl get pods -n production -l app=api -o wide --context staging",
};

const getElement = (id) => document.getElementById(id);

const writeOutput = (id, value, isError = false) => {
  const output = getElement(id);
  if (output.tagName === "PRE") {
    output.replaceChildren();
    output.textContent = value;
  } else {
    output.textContent = value;
  }
  output.classList.toggle("error", isError);
};

const writeDiffOutput = (lines) => {
  const output = getElement("diff-output");
  output.replaceChildren();
  output.classList.remove("error");

  if (!lines.length) {
    output.textContent = "No differences found.";
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const line of lines) {
    const row = document.createElement("span");
    row.className = "diff-line";
    if (line.startsWith("+ ")) {
      row.classList.add("add");
    } else if (line.startsWith("- ")) {
      row.classList.add("del");
    } else {
      row.classList.add("ctx");
    }
    row.textContent = line;
    fragment.append(row, document.createTextNode("\n"));
  }
  output.append(fragment);
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

const md5 = (text) => {
  const bytes = encoder.encode(text);
  const originalLength = bytes.length;
  const bitLength = BigInt(originalLength) * 8n;
  const paddedLength = (((originalLength + 8) >> 6) + 1) << 6;
  const buffer = new Uint8Array(paddedLength);
  buffer.set(bytes);
  buffer[originalLength] = 0x80;
  const view = new DataView(buffer.buffer);
  view.setUint32(paddedLength - 8, Number(bitLength & 0xffffffffn), true);
  view.setUint32(paddedLength - 4, Number((bitLength >> 32n) & 0xffffffffn), true);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const rotateLeft = (value, amount) => (value << amount) | (value >>> (32 - amount));
  const add = (x, y) => (x + y) >>> 0;

  const f = (x, y, z) => (x & y) | (~x & z);
  const g = (x, y, z) => (x & z) | (y & ~z);
  const h = (x, y, z) => x ^ y ^ z;
  const iFn = (x, y, z) => y ^ (x | ~z);

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const k = Array.from({ length: 64 }, (_, index) =>
    Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32)
  );

  for (let offset = 0; offset < paddedLength; offset += 64) {
    const chunk = new Array(16);
    for (let index = 0; index < 16; index += 1) {
      chunk[index] = view.getUint32(offset + index * 4, true);
    }

    let A = a;
    let B = b;
    let C = c;
    let D = d;

    for (let index = 0; index < 64; index += 1) {
      let formula;
      let chunkIndex;
      if (index < 16) {
        formula = f(B, C, D);
        chunkIndex = index;
      } else if (index < 32) {
        formula = g(B, C, D);
        chunkIndex = (5 * index + 1) % 16;
      } else if (index < 48) {
        formula = h(B, C, D);
        chunkIndex = (3 * index + 5) % 16;
      } else {
        formula = iFn(B, C, D);
        chunkIndex = (7 * index) % 16;
      }

      const temp = D;
      D = C;
      C = B;
      B = add(B, rotateLeft(add(add(A, formula), add(k[index], chunk[chunkIndex])), s[index]));
      A = temp;
    }

    a = add(a, A);
    b = add(b, B);
    c = add(c, C);
    d = add(d, D);
  }

  const toHex = (value) => {
    const hex = [];
    for (let index = 0; index < 4; index += 1) {
      hex.push(((value >>> (index * 8)) & 0xff).toString(16).padStart(2, "0"));
    }
    return hex.join("");
  };

  return `${toHex(a)}${toHex(b)}${toHex(c)}${toHex(d)}`;
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
  const algorithm = getElement("hash-algorithm").value;

  if (algorithm === "MD5") {
    writeOutput("hash-output", `${md5(input)}\n\nNote: MD5 is fine for checksums, not password storage.`);
    return;
  }

  const digest = await crypto.subtle.digest(algorithm, encoder.encode(input));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
  writeOutput("hash-output", hash);
};

const generateUuid = () => {
  const count = Number.parseInt(getElement("uuid-count").value, 10);
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    writeOutput("uuid-output", "Choose a count from 1 to 50.", true);
    return;
  }

  writeOutput(
    "uuid-output",
    Array.from({ length: count }, () => crypto.randomUUID()).join("\n")
  );
};

const formatJson = (space) => {
  try {
    const parsed = JSON.parse(getElement("json-input").value);
    writeOutput("json-output", JSON.stringify(parsed, null, space));
  } catch (error) {
    writeOutput("json-output", `Invalid JSON: ${error.message}`, true);
  }
};

const populateTimezones = () => {
  const zones =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : ["UTC", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney"];

  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const preferred = ["UTC", localZone, ...zones.filter((zone) => zone !== "UTC" && zone !== localZone)];
  const unique = [...new Set(preferred)];

  for (const selectId of ["timestamp-timezone", "cron-timezone"]) {
    const select = getElement(selectId);
    select.replaceChildren();
    for (const zone of unique) {
      const option = document.createElement("option");
      option.value = zone;
      option.textContent = zone;
      if (zone === localZone) {
        option.selected = true;
      }
      select.append(option);
    }
  }
};

const formatInTimeZone = (date, timeZone) => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return date.toISOString();
  }
};

const convertTimestamp = () => {
  const input = getElement("timestamp-input").value.trim();
  const timeZone = getElement("timestamp-timezone").value || "UTC";

  if (!input) {
    writeOutput("timestamp-output", "Enter a Unix timestamp or ISO date.", true);
    return;
  }

  const numericValue = Number(input);
  const date = Number.isFinite(numericValue)
    ? new Date(input.length <= 10 ? numericValue * 1000 : numericValue)
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
      `${timeZone}: ${formatInTimeZone(date, timeZone)}`,
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

const queryToJson = () => {
  try {
    const input = getElement("query-input").value.trim().replace(/^\?/, "");
    if (input.startsWith("{") || input.startsWith("[")) {
      const parsed = JSON.parse(input);
      writeOutput("query-output", JSON.stringify(parsed, null, 2));
      return;
    }

    const params = new URLSearchParams(input);
    const result = {};
    for (const [key, value] of params.entries()) {
      if (Object.hasOwn(result, key)) {
        result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value];
      } else {
        result[key] = value;
      }
    }
    writeOutput("query-output", JSON.stringify(result, null, 2));
  } catch (error) {
    writeOutput("query-output", `Could not convert: ${error.message}`, true);
  }
};

const jsonToQuery = () => {
  try {
    const input = getElement("query-input").value.trim();
    const parsed = input.startsWith("{") ? JSON.parse(input) : JSON.parse(getElement("query-output").value || input);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Provide a JSON object.");
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, String(item)));
      } else if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }
    writeOutput("query-output", params.toString());
  } catch (error) {
    writeOutput("query-output", `Could not convert: ${error.message}`, true);
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

const formatCronValues = (parsedField) => {
  if (parsedField.isWildcard) {
    return "any";
  }

  return [...parsedField.values].sort((first, second) => first - second).join(", ");
};

const parseCronExpression = (expression) => {
  const fields = expression.trim().split(/\s+/);

  if (fields.length !== 5 && fields.length !== 6) {
    throw new Error("Use 5 fields (min hour dom month dow) or 6 fields (sec min hour dom month dow).");
  }

  const configs = fields.length === 6 ? cronFieldConfigsSix : cronFieldConfigsFive;
  return {
    hasSeconds: fields.length === 6,
    parsedFields: fields.map((field, index) => parseCronField(field, configs[index])),
    configs,
  };
};

const getZonedParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(date);

  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour === "24" ? "0" : map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: weekdayMap[map.weekday],
  };
};

const dateMatchesCron = (date, parsedFields, hasSeconds, timeZone) => {
  const parts = getZonedParts(date, timeZone);
  let seconds;
  let minutes;
  let hours;
  let daysOfMonth;
  let months;
  let daysOfWeek;

  if (hasSeconds) {
    [seconds, minutes, hours, daysOfMonth, months, daysOfWeek] = parsedFields;
  } else {
    seconds = { values: new Set([0]), isWildcard: false };
    [minutes, hours, daysOfMonth, months, daysOfWeek] = parsedFields;
  }

  const dayOfMonthMatches = daysOfMonth.values.has(parts.day);
  const dayOfWeekMatches = daysOfWeek.values.has(parts.weekday);
  const dayMatches =
    daysOfMonth.isWildcard || daysOfWeek.isWildcard
      ? dayOfMonthMatches && dayOfWeekMatches
      : dayOfMonthMatches || dayOfWeekMatches;

  return (
    seconds.values.has(parts.second) &&
    minutes.values.has(parts.minute) &&
    hours.values.has(parts.hour) &&
    months.values.has(parts.month) &&
    dayMatches
  );
};

const getNextCronRuns = (parsedFields, hasSeconds, timeZone, limit = 5) => {
  const runs = [];
  const cursor = new Date();
  cursor.setMilliseconds(0);
  if (hasSeconds) {
    cursor.setSeconds(cursor.getSeconds() + 1);
  } else {
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  const stepMs = hasSeconds ? 1000 : 60_000;
  const endTime = cursor.getTime() + 366 * 24 * 60 * 60 * 1000;
  let guard = 0;

  while (runs.length < limit && cursor.getTime() <= endTime && guard < 2_000_000) {
    if (dateMatchesCron(cursor, parsedFields, hasSeconds, timeZone)) {
      runs.push(new Date(cursor));
    }
    cursor.setTime(cursor.getTime() + stepMs);
    guard += 1;
  }

  if (runs.length === 0) {
    throw new Error("No matching run time found in the next year.");
  }

  return runs;
};

const explainCron = () => {
  try {
    const expression = getElement("cron-input").value;
    const timeZone = getElement("cron-timezone").value || "UTC";
    const { parsedFields, hasSeconds, configs } = parseCronExpression(expression);
    const fieldSummary = parsedFields
      .map((field, index) => `${configs[index].label}: ${formatCronValues(field)}`)
      .join("\n");
    const nextRuns = getNextCronRuns(parsedFields, hasSeconds, timeZone)
      .map((date) => `${date.toISOString()} · ${formatInTimeZone(date, timeZone)}`)
      .join("\n");

    writeOutput(
      "cron-output",
      [
        `Expression: ${expression.trim()} (${hasSeconds ? "6-field with seconds" : "5-field"})`,
        `Timezone: ${timeZone}`,
        fieldSummary,
        "Next 5 runs:",
        nextRuns,
      ].join("\n\n")
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
  if (!input.trim()) {
    writeOutput("yaml-output", "Paste YAML to validate.", true);
    return;
  }

  if (typeof jsyaml === "undefined") {
    writeOutput("yaml-output", "YAML parser is still loading. Try again in a moment.", true);
    return;
  }

  try {
    const parsed = jsyaml.load(input);
    const type = parsed === null ? "null" : Array.isArray(parsed) ? "array" : typeof parsed;
    writeOutput(
      "yaml-output",
      [
        "YAML is valid.",
        `Top-level type: ${type}`,
        typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
          ? `Top-level keys: ${Object.keys(parsed).join(", ") || "(none)"}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    );
  } catch (error) {
    writeOutput("yaml-output", `Invalid YAML: ${error.message}`, true);
  }
};

const formatYaml = () => {
  const input = getElement("yaml-input").value;
  if (typeof jsyaml === "undefined") {
    writeOutput("yaml-output", "YAML parser is still loading. Try again in a moment.", true);
    return;
  }

  try {
    const parsed = jsyaml.load(input);
    const formatted = jsyaml.dump(parsed, { indent: 2, lineWidth: 100, noRefs: true }).trim();
    getElement("yaml-input").value = formatted;
    writeOutput("yaml-output", formatted || "(empty document)");
  } catch (error) {
    writeOutput("yaml-output", `Could not format YAML: ${error.message}`, true);
  }
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
    const now = Math.floor(Date.now() / 1000);
    const warnings = [];

    if (Number.isFinite(payload.exp) && payload.exp < now) {
      warnings.push(`Expired ${now - payload.exp}s ago.`);
    }
    if (Number.isFinite(payload.nbf) && payload.nbf > now) {
      warnings.push(`Not valid for another ${payload.nbf - now}s (nbf in the future).`);
    }
    if (Number.isFinite(payload.iat) && payload.iat > now + 300) {
      warnings.push("Issued-at (iat) is unusually far in the future.");
    }
    if (!payload.exp) {
      warnings.push("No exp claim — token may never expire.");
    }

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
        warnings.length ? `Warnings:\n- ${warnings.join("\n- ")}` : "Warnings: none detected for time claims.",
        "",
        "Decoded only. Signature verification requires the issuer secret or public key.",
      ].join("\n")
    );
  } catch (error) {
    writeOutput("jwt-output", `Could not decode JWT: ${error.message}`, true);
  }
};

const extractAsn1Strings = (bytes) => {
  const strings = [];
  let index = 0;

  while (index < bytes.length) {
    const tag = bytes[index];
    index += 1;
    if (index >= bytes.length) {
      break;
    }

    let length = bytes[index];
    index += 1;
    if (length & 0x80) {
      const lengthBytes = length & 0x7f;
      if (lengthBytes === 0 || index + lengthBytes > bytes.length) {
        break;
      }
      length = 0;
      for (let offset = 0; offset < lengthBytes; offset += 1) {
        length = (length << 8) | bytes[index + offset];
      }
      index += lengthBytes;
    }

    if (index + length > bytes.length) {
      break;
    }

    const slice = bytes.slice(index, index + length);
    if (tag === 0x0c || tag === 0x13 || tag === 0x16 || tag === 0x1a || tag === 0x1e) {
      const decoded =
        tag === 0x1e
          ? new TextDecoder("utf-16be").decode(slice)
          : new TextDecoder().decode(slice);
      if (decoded && /^[\x20-\x7E]+$/.test(decoded) && decoded.length >= 2) {
        strings.push(decoded);
      }
    } else if (tag === 0x30 || tag === 0x31 || tag === 0xa0 || tag === 0xa3) {
      strings.push(...extractAsn1Strings(slice));
    }

    index += length;
  }

  return strings;
};

const decodePem = () => {
  try {
    const input = getElement("pem-input").value.trim();
    const blocks = [...input.matchAll(/-----BEGIN ([^-]+)-----([\s\S]*?)-----END \1-----/g)];

    if (blocks.length === 0) {
      throw new Error("No PEM blocks found. Expected -----BEGIN ...----- sections.");
    }

    const reports = blocks.map((match, index) => {
      const type = match[1].trim();
      const body = match[2].replace(/\s+/g, "");
      const binary = atob(body);
      const bytes = Uint8Array.from(binary, (character) => character.codePointAt(0));
      const lines = [
        `Block ${index + 1}: ${type}`,
        `Bytes: ${bytes.length}`,
        `Base64 length: ${body.length}`,
      ];

      if (type.includes("CERTIFICATE")) {
        const strings = extractAsn1Strings(bytes);
        const interesting = [...new Set(strings)].filter(
          (value) =>
            value.includes(".") ||
            value.includes(" ") ||
            /CN=|OU=|O=|C=|L=|ST=/i.test(value) ||
            value.length <= 64
        );
        lines.push("Extracted readable strings:");
        lines.push(...(interesting.slice(0, 30).map((value) => `- ${value}`) || ["- (none)"]));
        lines.push("", "Note: this is a local PEM decode, not a full X.509 validator.");
      }

      return lines.join("\n");
    });

    writeOutput("pem-output", reports.join("\n\n"));
  } catch (error) {
    writeOutput("pem-output", error.message, true);
  }
};

const ipv4ToNumber = (ipAddress) => {
  const octets = ipAddress.split(".").map((part) => Number.parseInt(part, 10));

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    throw new Error("Enter a valid IPv4 address.");
  }

  return octets.reduce((result, octet) => ((result << 8) | octet) >>> 0, 0);
};

const numberToIpv4 = (value) =>
  [24, 16, 8, 0].map((shift) => ((value >>> shift) & 255).toString()).join(".");

const expandIpv6 = (address) => {
  const [head, tail] = address.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];

  if (address.includes("::")) {
    const missing = 8 - (headParts.length + tailParts.length);
    if (missing < 0) {
      throw new Error("Invalid IPv6 address.");
    }
    return [...headParts, ...Array.from({ length: missing }, () => "0"), ...tailParts];
  }

  const parts = address.split(":");
  if (parts.length !== 8) {
    throw new Error("Invalid IPv6 address.");
  }
  return parts;
};

const ipv6ToBigInt = (address) => {
  if (address.includes(".")) {
    throw new Error("IPv4-mapped IPv6 is not supported in this calculator.");
  }

  const parts = expandIpv6(address.toLowerCase());
  return parts.reduce((result, part) => {
    if (!/^[0-9a-f]{1,4}$/.test(part)) {
      throw new Error("Invalid IPv6 address.");
    }
    return (result << 16n) + BigInt(Number.parseInt(part, 16));
  }, 0n);
};

const bigIntToIpv6 = (value) => {
  const parts = [];
  let remaining = value;
  for (let index = 0; index < 8; index += 1) {
    parts.unshift((remaining & 0xffffn).toString(16));
    remaining >>= 16n;
  }
  return parts.join(":");
};

const parseCidr = (input) => {
  const trimmed = input.trim();
  const slash = trimmed.lastIndexOf("/");
  if (slash === -1) {
    throw new Error("Use CIDR format like 10.0.12.34/24 or 2001:db8::/32.");
  }

  const address = trimmed.slice(0, slash);
  const prefix = Number.parseInt(trimmed.slice(slash + 1), 10);
  const isIpv6 = address.includes(":");

  if (isIpv6) {
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 128) {
      throw new Error("IPv6 prefix must be between 0 and 128.");
    }
    const ip = ipv6ToBigInt(address);
    const mask = prefix === 0 ? 0n : (~0n << BigInt(128 - prefix)) & ((1n << 128n) - 1n);
    const network = ip & mask;
    const broadcast = network | (~mask & ((1n << 128n) - 1n));
    return {
      version: 6,
      prefix,
      network,
      broadcast,
      total: 1n << BigInt(128 - prefix),
      networkText: `${bigIntToIpv6(network)}/${prefix}`,
      firstText: bigIntToIpv6(network),
      lastText: bigIntToIpv6(broadcast),
    };
  }

  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error("IPv4 prefix must be between 0 and 32.");
  }

  const ipNumber = ipv4ToNumber(address);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ipNumber & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);
  const usableHosts = prefix >= 31 ? totalAddresses : Math.max(totalAddresses - 2, 0);
  const firstUsable = prefix >= 31 ? network : network + 1;
  const lastUsable = prefix >= 31 ? broadcast : broadcast - 1;

  return {
    version: 4,
    prefix,
    network,
    broadcast,
    mask,
    total: BigInt(totalAddresses),
    usableHosts,
    networkText: `${numberToIpv4(network)}/${prefix}`,
    firstText: numberToIpv4(firstUsable),
    lastText: numberToIpv4(lastUsable),
    maskText: numberToIpv4(mask),
    wildcardText: numberToIpv4((~mask) >>> 0),
    broadcastText: numberToIpv4(broadcast),
  };
};

const calculateCidr = () => {
  try {
    const cidr = parseCidr(getElement("cidr-input").value);

    if (cidr.version === 6) {
      writeOutput(
        "cidr-output",
        [
          `Version: IPv6`,
          `Network: ${cidr.networkText}`,
          `First address: ${cidr.firstText}`,
          `Last address: ${cidr.lastText}`,
          `Total addresses: ${cidr.total.toLocaleString()}`,
        ].join("\n")
      );
      return;
    }

    writeOutput(
      "cidr-output",
      [
        `Version: IPv4`,
        `Network: ${cidr.networkText}`,
        `Subnet mask: ${cidr.maskText}`,
        `Wildcard mask: ${cidr.wildcardText}`,
        `Broadcast: ${cidr.broadcastText}`,
        `First usable: ${cidr.firstText}`,
        `Last usable: ${cidr.lastText}`,
        `Total addresses: ${Number(cidr.total).toLocaleString()}`,
        `Usable hosts: ${cidr.usableHosts.toLocaleString()}`,
      ].join("\n")
    );
  } catch (error) {
    writeOutput("cidr-output", error.message, true);
  }
};

const checkOverlap = () => {
  try {
    const a = parseCidr(getElement("overlap-a").value);
    const b = parseCidr(getElement("overlap-b").value);

    if (a.version !== b.version) {
      throw new Error("Both CIDRs must be the same IP version.");
    }

    const overlaps = a.network <= b.broadcast && b.network <= a.broadcast;
    const aContainsB = a.network <= b.network && a.broadcast >= b.broadcast;
    const bContainsA = b.network <= a.network && b.broadcast >= a.broadcast;

    let relationship = "No overlap.";
    if (aContainsB && bContainsA) {
      relationship = "Identical ranges.";
    } else if (aContainsB) {
      relationship = "CIDR A fully contains CIDR B.";
    } else if (bContainsA) {
      relationship = "CIDR B fully contains CIDR A.";
    } else if (overlaps) {
      relationship = "Ranges overlap partially.";
    }

    writeOutput(
      "overlap-output",
      [
        `A: ${a.networkText}`,
        `B: ${b.networkText}`,
        `Overlap: ${overlaps ? "yes" : "no"}`,
        `Relationship: ${relationship}`,
      ].join("\n")
    );
  } catch (error) {
    writeOutput("overlap-output", error.message, true);
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
        [
          `Match ${matches.length + 1}: "${match[0]}" at index ${match.index}`,
          ...match.slice(1).map((group, index) => `  Group ${index + 1}: ${group ?? ""}`),
        ].join("\n")
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

  if (oldLines.length * newLines.length > 250_000) {
    throw new Error(
      `Inputs are large (${oldLines.length} × ${newLines.length} lines). Diff may be slow — trim the paste or split the files.`
    );
  }

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

  return diff;
};

const compareText = () => {
  try {
    const oldText = getElement("diff-old").value;
    const newText = getElement("diff-new").value;
    const diff = buildLineDiff(oldText, newText);
    writeDiffOutput(diff);
  } catch (error) {
    writeOutput("diff-output", error.message, true);
  }
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
    "x-request-id": "Correlation ID for tracing a request across services.",
    "content-encoding": "Compression applied to the body, such as gzip or br.",
    accept: "Tells the server which content types the client can handle.",
  };

  return tips[headerName] ?? "Check casing, proxy behavior, and whether this header is request-only or response-only.";
};

const tokenizeCommand = (command) => {
  const tokens = [];
  const pattern = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|[^\s]+/g;
  let match = pattern.exec(command);
  while (match) {
    tokens.push(match[0]);
    match = pattern.exec(command);
  }
  return tokens;
};

const explainCli = () => {
  const input = getElement("cli-input").value.trim();
  if (!input) {
    writeOutput("cli-output", "Paste a kubectl or docker command.", true);
    return;
  }

  const tokens = tokenizeCommand(input);
  const binary = tokens[0]?.replace(/^.*\//, "");
  if (binary !== "kubectl" && binary !== "docker") {
    writeOutput("cli-output", "Supported binaries: kubectl and docker.", true);
    return;
  }

  const kubectlFlags = {
    "-n": "Namespace selector",
    "--namespace": "Namespace selector",
    "-o": "Output format",
    "--output": "Output format",
    "-l": "Label selector",
    "--selector": "Label selector",
    "--context": "Kubeconfig context to use",
    "--kubeconfig": "Path to kubeconfig file",
    "-A": "All namespaces",
    "--all-namespaces": "All namespaces",
    "-f": "Filename / manifest path",
    "--filename": "Filename / manifest path",
    "--dry-run": "Show what would happen without applying",
    "-w": "Watch for changes",
    "--watch": "Watch for changes",
  };

  const dockerFlags = {
    "-d": "Run container in detached mode",
    "--detach": "Run container in detached mode",
    "-p": "Publish container port to host",
    "--publish": "Publish container port to host",
    "-e": "Set environment variable",
    "--env": "Set environment variable",
    "-v": "Bind mount a volume",
    "--volume": "Bind mount a volume",
    "--name": "Assign a container name",
    "--rm": "Remove container when it exits",
    "-it": "Interactive terminal",
    "-i": "Keep STDIN open",
    "-t": "Allocate a TTY",
    "--network": "Connect to a network",
    "-f": "Filter or compose file depending on subcommand",
    "--file": "Compose file path",
  };

  const flagMap = binary === "kubectl" ? kubectlFlags : dockerFlags;
  const lines = [`Binary: ${binary}`, `Tokens: ${tokens.length}`];
  if (tokens[1]) {
    lines.push(`Subcommand: ${tokens.slice(1).find((token) => !token.startsWith("-")) ?? "(none)"}`);
  }

  lines.push("", "Breakdown:");
  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.startsWith("-")) {
      const [flag, inlineValue] = token.split("=");
      const meaning = flagMap[flag] ?? "Unrecognized flag (still passed through to the CLI).";
      const value =
        inlineValue ??
        (tokens[index + 1] && !tokens[index + 1].startsWith("-") ? tokens[index + 1] : null);
      lines.push(`- ${flag}${value ? ` ${value}` : ""} → ${meaning}`);
      if (value && !inlineValue && tokens[index + 1] && !tokens[index + 1].startsWith("-")) {
        index += 1;
      }
    } else {
      lines.push(`- ${token} → argument / resource`);
    }
  }

  writeOutput("cli-output", lines.join("\n"));
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

const swapIo = (spec) => {
  const [inputId, outputId] = spec.split(":");
  const input = getElement(inputId);
  const outputText = getOutputText(outputId);
  if (!outputText) {
    return;
  }
  input.value = outputText;
};

const clearFields = (spec) => {
  for (const id of spec.split(",")) {
    const element = getElement(id);
    if (!element) {
      continue;
    }
    if (element.tagName === "OUTPUT" || element.tagName === "PRE") {
      writeOutput(id, "");
    } else {
      element.value = "";
    }
  }
};

const applySample = (name) => {
  if (name === "overlap") {
    getElement("overlap-a").value = "10.0.0.0/16";
    getElement("overlap-b").value = "10.0.12.0/24";
    checkOverlap();
    return;
  }

  if (name === "regex") {
    getElement("regex-pattern").value = "error|warn|fail(?:ed|ure)?";
    getElement("regex-flags").value = "gi";
    getElement("regex-input").value =
      "INFO ready\nWARN disk almost full\nERROR connection failed\nINFO retrying";
    testRegex();
    return;
  }

  if (name === "diff") {
    getElement("diff-old").value = "replicas: 2\nimage: api:1.0\nenv: prod";
    getElement("diff-new").value = "replicas: 3\nimage: api:1.1\nenv: prod\nregion: eu";
    compareText();
    return;
  }

  if (name === "cidr") {
    getElement("cidr-input").value = samples.cidr;
    calculateCidr();
    return;
  }

  if (name === "pem") {
    getElement("pem-input").value = [
      "-----BEGIN PRIVATE KEY-----",
      "MC4CAQAwBQYDK2VwBCIEIJqkoxrW1pI2uogSfUEd1BRgkZjhcnFg4l+Wq+B1pK6H",
      "-----END PRIVATE KEY-----",
      "",
      "-----BEGIN CERTIFICATE-----",
      "RGV2T3BzIFRvb2xzIGRlbW8gY2VydGlmaWNhdGUgcGF5bG9hZCBmb3IgbG9jYWwgUEVNIGRlY29k",
      "ZSBVSSB0ZXN0aW5nISE=",
      "-----END CERTIFICATE-----",
    ].join("\n");
    decodePem();
    return;
  }

  const map = {
    base64: ["base64-input", samples.base64, encodeBase64],
    hash: ["hash-input", samples.hash, generateHash],
    json: ["json-input", samples.json, () => formatJson(2)],
    url: ["url-input", samples.url, encodeUrl],
    query: ["query-input", samples.query, queryToJson],
    yaml: ["yaml-input", samples.yaml, validateYaml],
    jwt: ["jwt-input", samples.jwt, decodeJwt],
    cli: ["cli-input", samples.cli, explainCli],
  };

  const entry = map[name];
  if (!entry) {
    return;
  }

  getElement(entry[0]).value = entry[1];
  entry[2]();
};

const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("devops-tools-theme", theme);
  getElement("theme-toggle").textContent = theme === "light" ? "Dark" : "Light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = theme === "light" ? "#f3f6fb" : "#07111f";
  }
};

const initTheme = () => {
  const stored = localStorage.getItem("devops-tools-theme");
  if (stored === "light" || stored === "dark") {
    setTheme(stored);
    return;
  }
  setTheme(window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
};

const setSidebarOpen = (open) => {
  document.body.classList.toggle("sidebar-open", open);
  getElement("sidebar-toggle").setAttribute("aria-expanded", String(open));
  getElement("sidebar-backdrop").hidden = !open;
};

const filterTools = (query) => {
  const normalized = query.trim().toLowerCase();
  const links = [...document.querySelectorAll("[data-tool-link]")];
  const cards = [...document.querySelectorAll("[data-tool]")];
  let visible = 0;

  for (const link of links) {
    const haystack = `${link.textContent} ${link.dataset.keywords || ""}`.toLowerCase();
    const match = !normalized || haystack.includes(normalized);
    link.hidden = !match;
    if (match) {
      visible += 1;
    }
  }

  for (const group of document.querySelectorAll(".sidebar-group")) {
    const anyVisible = [...group.querySelectorAll("[data-tool-link]")].some((link) => !link.hidden);
    group.hidden = !anyVisible;
  }

  for (const card of cards) {
    const haystack = `${card.id} ${card.dataset.keywords || ""} ${card.querySelector("h2")?.textContent || ""}`.toLowerCase();
    const match = !normalized || haystack.includes(normalized);
    card.hidden = !match;
    card.classList.toggle("is-dimmed", Boolean(normalized) && !match);
  }

  getElement("search-status").textContent = normalized
    ? `${visible} tool${visible === 1 ? "" : "s"} matched`
    : "";
};

const updateActiveTool = () => {
  const links = [...document.querySelectorAll("[data-tool-link]")];
  const cards = [...document.querySelectorAll("[data-tool]")].filter((card) => !card.hidden);
  let activeId = null;
  const offset = 120;

  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    if (rect.top <= offset && rect.bottom > offset) {
      activeId = card.id;
      break;
    }
  }

  if (!activeId && cards.length) {
    activeId = cards[0].id;
  }

  for (const link of links) {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  }
};

const runFocusedTool = () => {
  const active = document.activeElement;
  const card = active?.closest?.("[data-tool]") || document.querySelector("[data-tool-link].is-active")?.getAttribute("href");
  const section =
    typeof card === "string"
      ? document.querySelector(card)
      : card || document.querySelector("[data-tool]:not([hidden])");

  if (!section) {
    return;
  }

  const runButton = section.querySelector("[data-run]");
  runButton?.click();
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
getElement("query-to-json").addEventListener("click", queryToJson);
getElement("query-to-qs").addEventListener("click", jsonToQuery);
getElement("yaml-validate").addEventListener("click", validateYaml);
getElement("yaml-format").addEventListener("click", formatYaml);
getElement("jwt-decode").addEventListener("click", decodeJwt);
getElement("pem-decode").addEventListener("click", decodePem);
getElement("cidr-calculate").addEventListener("click", calculateCidr);
getElement("overlap-check").addEventListener("click", checkOverlap);
getElement("regex-test").addEventListener("click", testRegex);
getElement("diff-compare").addEventListener("click", compareText);
getElement("http-explain").addEventListener("click", explainHttp);
getElement("cli-explain").addEventListener("click", explainCli);

document.querySelectorAll("[data-cron-preset]").forEach((button) => {
  button.addEventListener("click", () => applyCronPreset(button.dataset.cronPreset));
});

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => copyOutput(button.dataset.copyTarget, button));
});

document.querySelectorAll("[data-swap-io]").forEach((button) => {
  button.addEventListener("click", () => swapIo(button.dataset.swapIo));
});

document.querySelectorAll("[data-clear]").forEach((button) => {
  button.addEventListener("click", () => clearFields(button.dataset.clear));
});

document.querySelectorAll("[data-sample]").forEach((button) => {
  button.addEventListener("click", () => applySample(button.dataset.sample));
});

getElement("tool-search").addEventListener("input", (event) => {
  filterTools(event.target.value);
  updateActiveTool();
});

getElement("focus-search").addEventListener("click", () => {
  getElement("tool-search").focus();
  getElement("tool-search").select();
});

getElement("theme-toggle").addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
});

getElement("sidebar-toggle").addEventListener("click", () => {
  setSidebarOpen(!document.body.classList.contains("sidebar-open"));
});

getElement("sidebar-close").addEventListener("click", () => setSidebarOpen(false));
getElement("sidebar-backdrop").addEventListener("click", () => setSidebarOpen(false));

document.querySelectorAll("[data-tool-link]").forEach((link) => {
  link.addEventListener("click", () => setSidebarOpen(false));
});

window.addEventListener("scroll", updateActiveTool, { passive: true });

document.addEventListener("keydown", (event) => {
  const tag = event.target?.tagName;
  const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target?.isContentEditable;

  if (event.key === "/" && !typing) {
    event.preventDefault();
    getElement("tool-search").focus();
    return;
  }

  if (event.key === "?" && !typing) {
    event.preventDefault();
    getElement("help-dialog").showModal();
    return;
  }

  if (event.key === "Escape") {
    setSidebarOpen(false);
    if (getElement("help-dialog").open) {
      getElement("help-dialog").close();
    }
    return;
  }

  if (event.key === "Enter" && typing && tag !== "TEXTAREA" && !event.shiftKey) {
    const section = event.target.closest("[data-tool]");
    if (section) {
      event.preventDefault();
      section.querySelector("[data-run]")?.click();
    }
  }
});

initTheme();
populateTimezones();
generatePassword();
generateUuid();
useCurrentTimestamp();
explainCron();
calculateCidr();
checkOverlap();
explainHttp();
updateActiveTool();
