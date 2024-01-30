const express = require('express');
const passport = require('passport');
const auth = require('../../middlewares/auth');
const config = require('../../config/config');

const router = express.Router();

router.route('/google').get(auth(), (req, res) => {
  const token = req.user.id;
  res.send(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.google.clientId}&redirect_uri=${config.domainScheme}://${config.domain}/v1/oauth-mail-configs/google/callback&response_type=code&scope=profile email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/pubsub&include_granted_scopes=true&access_type=offline&state=${token}`
  );
});

router.route('/google/callback').get(
  passport.authenticate('google', {
    failureRedirect: '/failed',
  }),
  (req, res) => {
    res.redirect('/success');
  }
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: OauthMailConfigs
 *   description: MailConfig management and retrieval
 */
/**
 * @swagger
 * /oauth-mail-configs/google:
 *   get:
 *     summary: get link
 *     description: You can click [this links](https://accounts.google.com/o/oauth2/v2/auth?client_id=346127706595-bk0bd26cmouv5vd58k97mjdgtuaatc19.apps.googleusercontent.com&redirect_uri=https://maillistener.afarin.top/api/v1/auth/login/google&response_type=code&scope=profile) to external resources or additional documentation here.
 *     tags: [MailConfigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MailConfig'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /oauth-mail-configs/google/callback:
 *   get:
 *     summary: Get
 *     description: Only admins can retrieve all mailConfigs.
 *     tags: [MailConfigs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: code
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *         description: scope
 *       - in: query
 *         name: authuser
 *         schema:
 *           type: number
 *         description: 0
 *       - in: query
 *         name: prompt
 *         schema:
 *           type: string
 *         description: consent
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MailConfig'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /oauth-mail-configs:
 *   post:
 *     summary: Create a MailConfig
 *     description: Clients can create mail config.
 *     tags: [OauthMailConfigs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - imap_host
 *               - port
 *             properties:
 *               imap_host:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               port:
 *                  type: number
 *             example:
 *               email: fake@gmail.com
 *               password: password1
 *               imap_host: imap.gmail.com
 *               port: 993
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/MailConfig'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all MailConfigs
 *     description: Only admins can retrieve all mailConfigs.
 *     tags: [MailConfigs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: imap_host
 *         schema:
 *           type: string
 *         description: imap_host
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: email
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of mailConfigs
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MailConfig'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
