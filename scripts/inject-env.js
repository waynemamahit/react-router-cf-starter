import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

/**
 * Extract all placeholder keys from config files
 * Scans both source wrangler.jsonc and built wrangler.json
 * @returns {Array<string>} Sorted array of unique placeholder keys
 */
function extractPlaceholderKeys() {
  const sourceWranglerPath = path.join(rootDir, "wrangler.jsonc");
  const builtWranglerPath = path.join(rootDir, "build/server/wrangler.json");
  const keys = new Set();
  const placeholderRegex = /\$\{([A-Z_][A-Z0-9_]*)\}/g;

  // Extract from source wrangler.jsonc
  if (fs.existsSync(sourceWranglerPath)) {
    const content = fs.readFileSync(sourceWranglerPath, "utf-8");
    let match = placeholderRegex.exec(content);
    while (match) {
      keys.add(match[1]);
      match = placeholderRegex.exec(content);
    }
  }

  // Reset regex state
  placeholderRegex.lastIndex = 0;

  // Extract from built config if it exists
  if (fs.existsSync(builtWranglerPath)) {
    const content = fs.readFileSync(builtWranglerPath, "utf-8");
    let match = placeholderRegex.exec(content);
    while (match) {
      keys.add(match[1]);
      match = placeholderRegex.exec(content);
    }
  }

  return Array.from(keys).sort();
}

/**
 * Load environment variables from .dev.vars (local) or process.env (CI/CD)
 * @param {string} env - Environment name (local, staging, production)
 * @param {Array<string>} keys - Required placeholder keys
 * @returns {Object} Map of placeholder key -> extracted value
 */
function loadEnvironmentVariables(env, keys) {
  const vars = {};
  // Determine prefix based on environment
  let prefix = "";
  if (env === "staging") {
    prefix = "STAGING_";
  } else if (env === "production") {
    prefix = "PRODUCTION_";
  }
  // For 'local', prefix is empty.

  const isLocalDev =
    env === "local" || process.env.NODE_ENV === "development" || fs.existsSync(path.join(rootDir, ".dev.vars"));

  // Try to load from .dev.vars first if it exists, or if env is local
  // Note: Even if env is 'staging', if running locally we might want to check .dev.vars
  // The 'isLocalDev' check above is a bit broad, let's refine it.
  // We check .dev.vars if it exists.
  const devVarsPath = path.join(rootDir, ".dev.vars");
  let devVarsContent = null;
  if (fs.existsSync(devVarsPath)) {
    devVarsContent = fs.readFileSync(devVarsPath, "utf-8");
  }

  keys.forEach((key) => {
    const lookupKey = `${prefix}${key}`;
    let value = undefined;

    // 1. Try process.env (CI/CD has priority if set)
    if (process.env[lookupKey]) {
      value = process.env[lookupKey];
    }

    // 2. If not found and we have .dev.vars, try extracting from there
    if (value === undefined && devVarsContent) {
        const lines = devVarsContent
        .split("\n")
        .filter((line) => line.trim() && !line.trim().startsWith("#"));

        for (const line of lines) {
            const [k, ...valueParts] = line.split("=");
            const trimmedKey = k.trim();
            if (trimmedKey === lookupKey) {
                const v = valueParts.join("=").trim();
                value = v.replace(/^["']|["']$/g, ""); // Remove quotes
                break;
            }
        }
    }

    if (value !== undefined) {
      vars[key] = value;
    }
  });

  // If we are in strictly local mode and missing keys, we might want to create a template
  if (env === "local" && !fs.existsSync(devVarsPath) && keys.length > 0) {
      console.warn(`⚠️  .dev.vars not found at ${devVarsPath}`);
      console.warn("Creating .dev.vars template...");
      const template = keys.map((key) => `${key}=your_value_here`).join("\n");
      fs.writeFileSync(devVarsPath, template);
      console.warn(`✅ Template created. Please fill in values.`);
      throw new Error("Please fill in .dev.vars with your environment variables");
  }

  return vars;
}

/**
 * Recursively replace all placeholders in an object
 * @param {any} obj - Object/array/string to process
 * @param {Object} vars - Variables to inject
 * @returns {any} Object with placeholders replaced
 */
function replacePlaceholdersRecursive(obj, vars) {
  if (typeof obj === "string") {
    let result = obj;
    Object.entries(vars).forEach(([key, value]) => {
      const placeholder = `$${"{"}${key}${"}"}`;
      while (result.includes(placeholder)) {
        result = result.replace(placeholder, value);
      }
    });
    return result;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => replacePlaceholdersRecursive(item, vars));
  }

  if (obj !== null && typeof obj === "object") {
    const result = {};
    Object.keys(obj).forEach((key) => {
      result[key] = replacePlaceholdersRecursive(obj[key], vars);
    });
    return result;
  }

  return obj;
}

/**
 * Main injection function
 * @param {string} env - Environment name (local, staging, production)
 */
function injectEnvironmentVariables(env) {
  console.log(`\n🚀 Starting environment variable injection for ${env}...\n`);

  // Extract all placeholders
  const keys = extractPlaceholderKeys();

  if (keys.length === 0) {
    console.warn("⚠️  No placeholders found. Skipping injection.");
    return;
  }

  console.log(`📋 Found ${keys.length} placeholder(s):`);
  for (const key of keys) {
    console.log(`   - ${key}`);
  }

  // Load environment variables
  console.log("\n📦 Loading environment variables...");
  const vars = loadEnvironmentVariables(env, keys);

  // Validate all keys are present
  const missingKeys = keys.filter((key) => !vars[key]);
  if (missingKeys.length > 0) {
    console.error(`\n❌ Missing environment variables (checking for prefix: ${env === 'local' ? 'none' : env.toUpperCase() + '_'}):`);
    for (const key of missingKeys) {
      console.error(`   - ${key}`);
    }
    process.exit(1);
  }

  console.log("✅ All variables loaded:");
  Object.entries(vars).forEach(([key, value]) => {
    const display = value.length > 30 ? +`${value.substring(0, 30)}...` : value;
    console.log(`   ${key}=${display}`);
  });

  // Determine target file
  const builtWranglerPath = path.join(rootDir, "build/server/wrangler.json");
  const sourceWranglerPath = path.join(rootDir, "wrangler.jsonc");

  let targetPath = builtWranglerPath;
  if (!fs.existsSync(builtWranglerPath)) {
    if (!fs.existsSync(sourceWranglerPath)) {
      console.error(
        "\n❌ Neither build/server/wrangler.json nor wrangler.jsonc found",
      );
      process.exit(1);
    }
    targetPath = sourceWranglerPath;
    console.warn("\n⚠️  Using source wrangler.jsonc (build output not found)");
  }

  console.log(`\n🔧 Injecting into: ${path.relative(rootDir, targetPath)}`);

  // Read config
  let content = fs.readFileSync(targetPath, "utf-8");

  // Try JSON parsing for structured replacement
  try {
    const data = JSON.parse(content);

    // Replace recursively
    const updated = replacePlaceholdersRecursive(data, vars);
    content = JSON.stringify(updated, null, 2);

    console.log("✅ Parsed and processed as JSON");
  } catch {
    // Fallback: text-based replacement
    console.log("✅ Using text-based replacement (JSONC format)");
    Object.entries(vars).forEach(([key, value]) => {
      const placeholder = `$${"{"}${key}${"}"}`;
      const regex = new RegExp(placeholder.replace(/[${}]/g, "\\$&"), "g");
      content = content.replace(regex, value);
    });
  }

  // Write updated config
  fs.writeFileSync(targetPath, content);
  console.log("\n✅ Successfully wrote injected configuration");

  // Verify all placeholders were replaced
  console.log("\n🔍 Verifying replacement...");
  const verifyContent = fs.readFileSync(targetPath, "utf-8");
  const unreplaced = keys.filter((key) => {
    const placeholder = `$${"{"}${key}${"}"}`;
    return verifyContent.includes(placeholder);
  });

  if (unreplaced.length > 0) {
    console.warn("⚠️  WARNING: Some placeholders were not replaced:");
    for (const key of unreplaced) {
      console.warn(`   - ${key}`);
    }
    process.exit(1);
  }

  console.log("✅ Verification complete: All placeholders replaced!");
  console.log("\n✨ Injection completed successfully!\n");
}

// Main execution
const env = process.argv[2] || "local";

if (!["local", "staging", "production"].includes(env)) {
  console.error(`\n❌ Invalid environment: ${env}`);
  console.error("Usage: node inject-env.js [local|staging|production]\n");
  process.exit(1);
}

try {
  injectEnvironmentVariables(env);
} catch (error) {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
}
