const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const mailConfigValidation = require('../../validations/mail.config.validation');
const mailValidation = require('../../validations/mail.validation');
const { mailConfigController, mailController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('addMailConfig'), validate(mailConfigValidation.createMailConfig), mailConfigController.createMailConfig)
  .get(auth('getMailConfigs'), validate(mailConfigValidation.getMailConfigs), mailConfigController.getMailConfigs);

router
  .route('/:mailConfigId')
  .delete(auth('manageMailConfigs'), validate(mailConfigValidation.deleteMailConfig), mailConfigController.deleteMailConfig);

router
  .route('/:mailConfigId/send-email/')
  .post(auth('sendMail'), validate(mailValidation.sendMail), mailController.sendMail);

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

/**
 * @swagger
 * /mail-configs/{id}:
 *   delete:
 *     summary: Delete a mail-config
 *     description: Logged-in users can only delete their configs. Only admins can delete other configs.
 *     tags: [MailConfigs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MailConfigs id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /mail-configs/{id}/send-email/:
 *   post:
 *     summary: send email
 *     description: Logged-in users can send email.
 *     tags: [MailConfigs, Mail]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MailConfigs id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - text
 *             properties:
 *               subject:
 *                 type: string
 *               to:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               text:
 *                 type: string
 *             example:
 *               to: fake@gmail.com
 *               subject: Subject One
 *               text: Some Text
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/MailSchema'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
