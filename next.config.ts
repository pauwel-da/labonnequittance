import type { NextConfig } from "next";

// En local, le projet est dans iCloud Drive → le suffixe ".nosync" exclut le
// dossier de la sync iCloud (évite les conflits sur les fichiers temp de Next).
// Sur Vercel/CI, on garde le comportement par défaut (".next").
const isCI = !!(process.env.VERCEL || process.env.CI);

const nextConfig: NextConfig = {
  distDir: isCI ? ".next" : ".next.nosync",
  images: {
    qualities: [75, 85],
  },
};

export default nextConfig;
