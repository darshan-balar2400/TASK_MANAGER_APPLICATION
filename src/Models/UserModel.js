const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");

const UserStructure = new mongoose.Schema({
    firstname: {
        type: String,
        trim: true,
        required: true
    },
    lastname: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is not in valid formate !");
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value, { minNumbers: 1, minLength: 8, minLowercase: 1, minUppercase: 1, minSymbols: 1 })) {
                throw new Error("Password is not strong ! ");
            }
        }
    },
    phno: {
        type: Number,
        required: true
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// create the virtual propertie
UserStructure.virtual("tasks",{
    ref:"Task",
    localField:"_id",
    foreignField:"owner"
});

// before the creating the user we hash the password
UserStructure.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// -------------------------------- CREATE TOKEN ------------------------------
UserStructure.methods.generateAuthToken = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, `${process.env.SECRET_KEY}`);
    user.tokens = user.tokens.concat({ token: token });
    const saveUser = await user.save();
    return token;
}

// ------------------------ CHECK CREDENTIALS ---------------------------
UserStructure.statics.checkCredentials = async function (email, password) {
    try {
        // check the email is exist or not !
        const isEmailExists = await User.findOne({ email: email });
        // print error message if email is not exist
        if (!isEmailExists) {
            return res.status(404).send();
        }
        // if there is email
        // then check password matches with the returned email
        const isPasswordMatch = await bcrypt.compare(password, isEmailExists.password);
        // if password matches with the email
        if (!isPasswordMatch) {
            return res.status(404).send("Password is not match with email");
        }

        // then finally return the authenticate user
        return isEmailExists;
    }
    catch (e) {
        res.status(500).send({ "Error": "Server Error ! " });
    }
}

const User = new mongoose.model("User", UserStructure);

module.exports = User;