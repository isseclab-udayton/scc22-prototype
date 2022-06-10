const bcrypt = require('bcryptjs');
const passwordHash = bcrypt.hashSync('123456', 10);
// console.log(passwordHash)

const verified = bcrypt.compareSync('1234567', '$2a$10$WOn/FWpBjKA/CiG/149/i.NUdstLxx5rdrQcApn1k8srIyl8wbZzu');
console.log(verified)
