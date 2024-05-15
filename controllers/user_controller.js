const { User } = require("../models/db_schema")
const brcypt = require("bcrypt");
const notifier = require('node-notifier');
const registerUser = async (req, res) => {
    try {
        const { password, confirmPassword, ...rest } = req.body

        if (password !== confirmPassword) {
            console.log("Password Must Match")
            notifier.notify({
                title: 'Register',
                message: 'Password Must Match!',
                time: 100
            });
            res.redirect("/register")
            return
        }

        const hashPassword = await brcypt.hash(password.trim(), 10);
        const newUser = new User({ ...rest, password: hashPassword })
        await newUser.save()
        res.redirect("/subjects")

    }
    catch (error) {
        const duplicateKeyName = error.errorResponse.errmsg.match(/dup key: { (\w+: "[^"]+") }/)[1]
        console.log(duplicateKeyName ? `${duplicateKeyName} already exist` : "Something went wrong")

        notifier.notify({
            title: 'Register',
            message: duplicateKeyName ? `${duplicateKeyName} already exist` : "Something went wrong",
            time: 100
        });
        res.redirect("/register")

    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username }).lean()

        if (!user?._id) {
            console.log("Invalid Credentials")
            notifier.notify({
                title: 'Login',
                message: "Invalid Credentials",
                time: 100
            });
            res.redirect("/login")

        }
        else {
            const isMatch = await brcypt.compare(password, user?.password);
            if (!isMatch) {
                console.log("Invalid Credentials")
                notifier.notify({
                    title: 'Login',
                    message: "Invalid Credentials",
                    time: 100
                });
                res.redirect("/login")
                return
            }
            res.redirect("/subjects")
        }
    }
    catch (error) {
        console.log("Something went wrong")
        notifier.notify({
            title: 'Login',
            message: "Something went wrong",
            time: 100
        });
        res.redirect("/login")

    }
}

const renderRegister = (req, res) => {
    res.render("register.njk", {
        title: "Register",
    })
}


const renderLogin = (req, res) => {
    res.render("login.njk", {
        title: "Login",
    })
}

module.exports = {
    registerUser,
    renderRegister,
    loginUser,
    renderLogin
}