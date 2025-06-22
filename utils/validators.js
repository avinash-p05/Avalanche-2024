const validateCollegeEmail = (email) => {
    const emailRegex = /@students\.git\.edu$/;
    return emailRegex.test(email);
};

module.exports = {validateCollegeEmail};