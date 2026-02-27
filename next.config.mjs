import createMDX from "@next/mdx"

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  transpilePackages: ["lucide-react"],

  async redirects() {
    const home = process.env.HOME_PATHNAME || "/"
    if (home === "/") return []

    return [
      {
        source: "/:lang",
        destination: home,
        permanent: true,
        has: [
          {
            type: "cookie",
            key: "next-auth.session-token",
          },
        ],
      },
      {
        source: "/:lang",
        destination: home,
        permanent: true,
        has: [
          {
            type: "cookie",
            key: "__Secure-next-auth.session-token",
          },
        ],
      },
    ]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
