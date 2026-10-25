const serverless = require('serverless-http');
const app = require('../../backend/server');

const serverlessHandler = serverless(app);

exports.handler = async (event, context) => {
  // Normalize path if Netlify function is called directly or via redirect
  // e.g. /.netlify/functions/api/invitation -> /api/invitation
  if (event.path) {
    if (event.path.startsWith('/.netlify/functions/api')) {
      event.path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api');
    }
  }

  return await serverlessHandler(event, context);
};
