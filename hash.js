const bcrypt = require('bcryptjs'); // or 'bcryptjs' if that is what your project uses
const saltRounds = 10;
const plainPassword = 'david123'; // Replace with your actual password

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log("Your Hashed Password is:", hash);
});
