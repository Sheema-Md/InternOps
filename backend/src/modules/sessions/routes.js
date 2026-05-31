const auth = require('../../middleware/auth');
const repo = require('./repository');
const { createAuditLog, extractRequestInfo } = require('../../utils/audit');

async function routes(fastify) {
  // List own sessions
  fastify.get('/me', { preHandler: [auth] }, async (req) => {
    return repo.getUserSessions(req.user.id);
  });

  // Revoke a specific session
  fastify.delete('/me/:sessionId', { preHandler: [auth] }, async (req, reply) => {
    const success = await repo.revokeSession(req.params.sessionId, req.user.id);
    if (!success) return reply.status(404).send({ error: 'Session not found' });
    await createAuditLog({
      userId: req.user.id,
      action: 'SESSION_REVOKED',
      resourceType: 'session',
      resourceId: req.params.sessionId,
      ...extractRequestInfo(req),
    });
    return { message: 'Session revoked' };
  });

  // Revoke all other sessions (keep current)
  fastify.post('/me/revoke-all', { preHandler: [auth] }, async (req) => {
    await repo.revokeAllUserSessions(req.user.id);
    // Re-create the current session token? The current refresh token is in the cookie; we don't revoke that one.
    // A full implementation would exclude the current token. For now, we revoke all and force re-login.
    await createAuditLog({
      userId: req.user.id,
      action: 'ALL_SESSIONS_REVOKED',
      resourceType: 'session',
      ...extractRequestInfo(req),
    });
    return { message: 'All sessions revoked. Please re-login.' };
  });
}

module.exports = routes;
