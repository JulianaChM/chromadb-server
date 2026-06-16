/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Excluye la librería lancedb del empaquetado del lado del servidor
    if (isServer) {
      config.externals = [...config.externals, 'lancedb'];
    }
    
    return config;
  },
};

export default nextConfig;
