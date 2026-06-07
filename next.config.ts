import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ".next.nosync" → iCloud Drive ignore ce dossier (suffixe macOS)
  // Évite les conflits de sync sur les fichiers temp en dev
  distDir: ".next.nosync",
};

export default nextConfig;
