import fs from "fs";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";
import { loadEnv } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, "dist");

if (!fs.existsSync(distDir)) {
  console.error(
    '❌ Error: El directorio "dist" no existe. Debes ejecutar "pnpm run build" antes de empaquetar.'
  );
  process.exit(1);
}

/**
 * Gets the build configuration automatically from environment variables using Vite.
 */
async function getConfiguration() {
  // loadEnv lee automáticamente el archivo .env correcto según el modo (production)
  const env = loadEnv('production', process.cwd(), '');
  let appName = env.VITE_APP_NAME || "app";

  let warName = appName;
  if (!warName.endsWith(".war")) warName += ".war";

  console.log(`ℹ️ Usando nombre de aplicación: ${appName}`);
  return { warName };
}

async function run() {
  const config = await getConfiguration();

  const warFilePath = path.join(__dirname, config.warName);

  console.log(`📦 Empacando la aplicación en ${config.warName}...`);

  const output = fs.createWriteStream(warFilePath);
  const archive = archiver("zip", {
    zlib: { level: 6 },
  });

  output.on("close", () => {
    console.log(`✅ ¡Éxito! Archivo WAR generado: ${warFilePath}`);
    console.log(
      `📊 Tamaño final: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`
    );
  });

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") {
      console.warn("⚠️ Archiver warning:", err);
    } else {
      throw err;
    }
  });

  archive.on("error", (err) => {
    console.error("❌ Error fatal al generar el WAR:", err);
    throw err;
  });

  archive.pipe(output);

  // Add WEB-INF/web.xml to support Vue Router History Mode on Tomcat
  const webXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">
    <error-page>
        <error-code>404</error-code>
        <location>/index.html</location>
    </error-page>
</web-app>`;

  archive.append(webXmlContent, { name: "WEB-INF/web.xml" });

  // Append files from the build output directory
  archive.directory(distDir, false);

  // Finalize the archive
  archive.finalize();
}

run();
