const allRoles = {
  user: ['addMailConfig', 'getMailConfigs', 'manageMailConfigs', 'sendMail', 'receiveMail', 'getMyEmails'],
  admin: [
    'getUsers',
    'manageUsers',
    'addMailConfig',
    'getMailConfigs',
    'manageMailConfigs',
    'sendMail',
    'receiveMail',
    'getMyEmails',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
