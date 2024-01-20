const allRoles = {
  user: ['addMailConfig', 'getMailConfigs', 'manageMailConfigs', 'sendMail'],
  admin: ['getUsers', 'manageUsers', 'addMailConfig', 'getMailConfigs', 'manageMailConfigs', 'sendMail'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
