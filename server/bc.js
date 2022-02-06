const bcrypt = require("bcryptjs");
const { genSalt, compare } = bcrypt;

exports.hash = async (password) => {
    const salt = await genSalt();
    const hash = await bcrypt.hash(password, salt);
    if (!salt || !hash) {
        return "Error";
    }
    return {
        salt,
        hash,
    };
};

exports.compare = compare;
