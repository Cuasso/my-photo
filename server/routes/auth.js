const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')

router.get('/', (req, res) => {
    res.send('hello!!')
})

router.post('/signup', (req, res) => {
    const { name, email, password } = req.body
    if (!email || !password || !name) {
        res.status(422).json({ error: 'please add al the fields' })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({
                    error: 'user already exists with that email'
                })
            }
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email,
                        password: hashedPassword,
                        name
                    })

                    user.save()
                        .then(user => {
                            res.json({ message: "saved successfuly" })
                        })
                        .catch(err => { console.log(err) })
                })
                .catch(err => { console.log(err) })
        })
        .catch(err => { console.log(err) })
})

router.post('/signin', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(422).json({ error: 'please add email or password' })
    }
    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) res.status(422).json({ error: 'invalid email or password' })

            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        const token = jwt.sign({ _id: savedUser._id, }, JWT_SECRET)
                        const { _id, name, email } = savedUser
                        res.json({ token, user: { _id, name, email } })
                    } else {
                        res.status(422).json({ error: 'invalid email or password' })
                    }
                }).catch(err => console.log(err))
        })
})
module.exports = router