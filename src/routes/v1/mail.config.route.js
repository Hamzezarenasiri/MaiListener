const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const mailValidation = require('../../validations/mail.validation');
const mailController = require('../../controllers/mail.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('addMailConfig'), validate(mailValidation.createMailConfig), mailController.createMailConfig)
  .get(auth('getMailConfigs'), validate(mailValidation.getMailConfig), mailController.getMailConfigs);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: MailConfigs
 *   description: MailConfig management and retrieval
 */

/**
 * @swagger
 * /mail-configs:
 *   post:
 *     summary: Create a MailConfig
 *     description: Clients can create mail config.
 *     tags: [MailConfigs]
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
 *               - domain
 *               - port
 *             properties:
 *               domain:
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
 *               domain: gmail.com
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
 *         name: domain
 *         schema:
 *           type: string
 *         description: domain
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
