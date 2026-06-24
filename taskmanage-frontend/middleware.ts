export const config = {
  matcher: '/api/:path*',
};

export default function middleware(request: Request) {
  const url = new URL(request.url);

  // Read backend URL from environment variables
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return new Response('BACKEND_URL environment variable is missing', { status: 500 });
  }

  // Extract the path after /api (e.g. /api/auth/login -> /auth/login)
  const relativePath = url.pathname.replace(/^\/api/, '');

  // Normalize slashes for joining
  const cleanBase = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
  const cleanPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;

  // Build the target destination URL
  const targetUrl = cleanBase + cleanPath + url.search;

  return new Response(null, {
    headers: {
      'x-middleware-rewrite': targetUrl,
    },
  });
}
