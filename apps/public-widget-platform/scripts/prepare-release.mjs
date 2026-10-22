import { mkdir, copyFile, writeFile, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const distDir = resolve(projectRoot, "dist");
const packageJsonPath = resolve(projectRoot, "package.json");

const pkg = JSON.parse(await readFile(packageJsonPath, "utf8"));
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const version = args[0] || pkg.version;
if (!version) {
  throw new Error("Missing version. Provide an argument or set package.json version.");
}

const sourceFiles = [
  "xallindrome-widgets-sdk.iife.js",
  "xallindrome-widgets-sdk.iife.js.map",
  "xallindrome-widgets-sdk.es.js",
  "xallindrome-widgets-sdk.es.js.map",
];

const releaseDir = resolve(distDir, "release", "sdk", `v${version}`);
const latestDir = resolve(distDir, "release", "sdk", "latest");
await mkdir(releaseDir, { recursive: true });
await mkdir(latestDir, { recursive: true });

for (const file of sourceFiles) {
  const source = resolve(distDir, file);
  await copyFile(source, resolve(releaseDir, file));
  await copyFile(source, resolve(latestDir, file));
}

await writeFile(
  resolve(distDir, "release", "sdk", "latest.json"),
  JSON.stringify(
    {
      sdkVersion: version,
      generatedAt: new Date().toISOString(),
      files: sourceFiles,
      path: `/sdk/v${version}/`,
    },
    null,
    2
  ),
  "utf8"
);

console.log(`Prepared widget SDK release in ${releaseDir}`);
