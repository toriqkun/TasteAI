/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // untuk gambar upload dari Cloudinary
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com", // untuk hasil generate tanpa Cloudinary
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // kadang hasil dari Unsplash pakai domain ini juga
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com", // untuk foto dari Google Maps API
      },
    ],
  },
};

module.exports = nextConfig;
