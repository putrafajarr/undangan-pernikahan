const serverless = require('serverless-http');
const app = require('../../backend/server');

const serverlessHandler = serverless(app);

exports.handler = async (event, context) => {
  // Normalize path if Netlify function is called directly or via redirect
  // Handles:
  // /.netlify/functions/api/admin/login -> /api/admin/login
  // /admin/login -> /api/admin/login
  // /api/admin/login -> /api/admin/login
  if (event.path) {
    let cleanPath = event.path.replace(/^\/\.netlify\/functions\/api/, '');
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    if (!cleanPath.startsWith('/api')) {
      cleanPath = '/api' + (cleanPath === '/' ? '' : cleanPath);
    }
    event.path = cleanPath;
  }

  return await serverlessHandler(event, context);
};
