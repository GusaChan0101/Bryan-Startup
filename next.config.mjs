/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/main/dashboard',
        permanent: true,
      },
      {
        source: '/groups',
        destination: '/main/groups',
        permanent: true,
      },
      {
        source: '/social',
        destination: '/main/social',
        permanent: true,
      },
      {
        source: '/study-plans',
        destination: '/main/study-plans',
        permanent: true,
      },
      {
        source: '/study-plans/:id',
        destination: '/main/study-plans/:id',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
