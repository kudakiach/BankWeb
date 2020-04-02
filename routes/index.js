var express = require('express');
var router = express.Router();
const fs = require('fs');
const testFolder = './views/images/';
const filepath = './user.json';
const user = require('./user.json');
const acc = require('../accounts.json');
const path = require('path');
var events = require('events');
var mongoose = require('mongoose')
const flash = require('connect-flash')
mongoose.connect('mongodb+srv://mickeyvalour:abcd1234@mickeyvalour-nh28a.mongodb.net/miketeggart?retryWrites=true&w=majority', { useNewUrlParser: true }, (err) => {
    if (!err) {
        console.log('mongodb connected')
    } else { console.log(err + ' connection error') }
})

var accountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: 'This field is required'
    },
    Chequing: {
        type: Number,
        required: 'This field is required'
    },
    Savings: {
        type: Number,
        required: 'This field is required'
    }
})
accountModel = mongoose.model('webBanks', accountSchema);

router.get('/dashboard', requireLogin, (req, res) => {
    var user = req.session.user.username
    accountModel.findOne({ Username: user }, function(err, docs) {
        if (err) {
            redirect('/')
        }
        console.log(docs)
        res.render('index', { msg: req.flash('msg'), title: 'WEB BANK', username: req.session.user.username, savings: docs.Savings, chequing: docs.Chequing });
        //, savings: docs.Savings, chequing: docs.Chequing 
    })


});
router.get('/register', function(req, res) {
    res.render('register')
})
router.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    fs.readFile(filepath, function(err, data) {
        if (err) {
            console.log("error reading file")
        }
        const readData = JSON.parse(data.toString())

        readData[username] = password

        const jsonData = JSON.stringify(readData, null, 2)

        fs.writeFile(filepath, jsonData, { flag: 'w+' }, (err) => {
            if (err) {
                console.error(err)
                throw err
            } else {
                console.log(jsonData)
                res.render('index', { acc: accountNumber, type: accountT });
            }
        })

    })

})
router.post('/createAccount', requireLogin, function(req, res) {
    var accountT = req.body.accountType;
    var accountB = Number(req.body.accountBalance);


    fs.readFile('./accounts.json', function(err, data) {
        if (err) {
            console.log("error reading file")
        }
        const readData = JSON.parse(data.toString())
        console.log(parseInt(readData.lastID, 10) + 1);
        accountNumber = Number(readData.lastID) + 1;
        readData[accountNumber] = { AccoutType: accountT, accountBalance: accountB }
        readData.lastID = accountNumber
        const jsonData = JSON.stringify(readData, null, 2)
            // finding if user exist on the database
        var user = req.session.user.username
        console.log(user)
        accountModel.findOne({ Username: user }, function(err, docs) {
            if (err) {
                console.log("Error finding user")
            }
            console.log(docs.Savings)
                // checking if both accounts are registered
            if (docs.Savings != null && docs.Chequing != null) {
                var msg = "";
                req.flash('msg', 'You reached maximum number of your accounts')
                res.redirect('/dashboard')
            }
            // checking if
            if (docs.Savings == null) {
                if (accountT == "Savings") {
                    accountModel.updateOne({ "Username": user }, { $set: { Savings: accountNumber } }, function(err, docs) {
                        if (err) {
                            console.log("error updating")
                        }
                        console.log(docs)
                    })
                    console.log("Updating Savings account")
                }

                fs.writeFile('./accounts.json', jsonData, { flag: 'w+' }, (err) => {
                    if (err) {
                        console.error(err)
                        throw err
                    } else {
                        req.flash('msg', accountT + "account #" + accountNumber + " created")
                        res.redirect('/dashboard');
                    }
                })
            }

            if (docs.Chequing == null) {
                if (accountT == "Chequing") {
                    accountModel.updateOne({ "Username": user }, { $set: { Chequing: accountNumber } }, function(err, docs) {
                        if (err) {
                            console.log("error updating")
                        }
                        console.log(docs)
                    })
                    console.log("Updating Savings account")
                }

                fs.writeFile('./accounts.json', jsonData, { flag: 'w+' }, (err) => {
                    if (err) {
                        console.error(err)
                        throw err
                    } else {
                        req.flash('msg', accountT + "account #" + accountNumber + " created")

                        res.redirect('/dashboard');
                    }
                })

            }



        })



    })
})
router.get('/', function(req, res, next) {
    res.render('login', {
        'title': 'Login'
    });
});


router.post('/', (req, res) => {
    let error = '';

    if (user.hasOwnProperty(req.body.username)) {
        if (user[req.body.username] == req.body.password) {
            let userobj = {};
            userobj.username = req.body.username;
            userobj.password = req.body.password;
            console.log(userobj, "<<<<");
            req.session.user = userobj;
            console.log(req.session, "sess");
            res.redirect('/dashboard');
        } else {
            error = 'Incorrect password';
            res.render('login', {
                'title': 'Login',
                errors: error
            });
        }
    } else {
        error = 'Not a registered username';
        res.render('login', {
            'title': 'Login',
            errors: error
        });
    }

})


router.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/');
});

router.get('/account', requireLogin, function(req, res) {
    res.render("openAccount", { 'title': 'Open Account', username: req.session.user.username })
})
router.get('/balance', requireLogin, function(req, res) {
    fs.readFile('./accounts.json', function(err, data) {
        if (err) {
            console.log('')
        }
        readJson = JSON.parse(data);

    })
    res.render("balance", requireLogin, { 'title': 'Balance', username: req.session.user.username })
})

router.get('/withdraw', requireLogin, function(req, res) {
    res.render("withdraw", { 'title': 'Withdraw Cash', username: req.session.user.username })
})
router.get('/deposit', requireLogin, function(req, res) {
    res.render("deposit", { 'title': 'Deposit Amount', username: req.session.user.username })
})

router.post('/bank', requireLogin, function(req, res) {
    // 
    var request = req.body;
    // when create accout radio button is clicked, go to openaccpunt page
    if (request.banking == 'openaccount') {
        res.redirect('/account')
    } else if (request.banking == 'withdrawal') {
        if (acc.hasOwnProperty(req.body.accountNumber)) {
            var obj = acc[req.body.accountNumber];
            var keys = Object.keys(obj);

            var accountType = obj[keys[0]];
            var accountBalance = obj[keys[1]];
            res.render('withdraw', {
                accountNumber: req.body.accountNumber,
                accountType: accountType,
                balance: accountBalance
            })
        } else {
            req.flash('msg', 'account not found')
            res.redirect('/dashboard')
        }

    } else if (request.banking == 'deposit') {
        if (acc.hasOwnProperty(req.body.accountNumber)) {
            obj = acc[req.body.accountNumber];
            var keys = Object.keys(obj);

            var accountType = obj[keys[0]];
            var accountBalance = obj[keys[1]];

            res.render('deposit', {
                accountNumber: req.body.accountNumber,
                accountType: accountType,
                balance: accountBalance
            })
        } else {
            req.flash('msg', 'account not found')
            res.redirect('/dashboard')
        }

    } else if (request.banking == 'balance') {
        if (acc.hasOwnProperty(req.body.accountNumber)) {
            obj = acc[req.body.accountNumber];
            var keys = Object.keys(obj);

            var accountType = obj[keys[0]];
            var accountBalance = obj[keys[1]];

            res.render('balance', {
                accountNumber: req.body.accountNumber,
                accountType: accountType,
                balance: accountBalance
            })
        } else {
            req.flash('msg', 'account not found')
            res.redirect('/dashboard')
        }

    } else {
        console.log("Invalid Option")
    }
    // })
})

router.post('/depositAmount', function(req, res) {
    var account = req.body.accountNumber;
    var amount = req.body.amount;

    if (acc.hasOwnProperty(account)) {
        obj = acc[req.body.accountNumber];
        var keys = Object.keys(obj);

        var accountType = obj[keys[0]];
        var accountBalance = obj[keys[1]];


        fs.readFile('./accounts.json', function(err, data) {
            var readData = JSON.parse(data.toString());
            var newBalance = Number(amount) + Number(accountBalance);
            console.log(newBalance)
            readData[account] = {
                accountType: accountType,
                accountBalance: newBalance
            }
            jsonData = JSON.stringify(readData, null, 2)

            fs.writeFile('./accounts.json', jsonData, function(err) {
                if (err) {
                    console.log("error writing file")
                }
                console.log(jsonData)
                res.redirect('/dashboard')
            })
        })


    }
    // })
})

router.post('/WithdrawAmount', function(req, res) {
    var account = req.body.accountNumber;
    var amount = req.body.amount;

    if (acc.hasOwnProperty(account)) {
        obj = acc[req.body.accountNumber];
        var keys = Object.keys(obj);

        var accountType = obj[keys[0]];
        var accountBalance = obj[keys[1]];


        fs.readFile('./accounts.json', function(err, data) {
            var readData = JSON.parse(data.toString());
            if (Number(amount) > Number(accountBalance)) {
                var msg = "Insufficient Funds";
                console.log(msg)
                req.flash('msg', 'Insufficient Funds')
                res.redirect('/dashboard')
            } else {
                var newBalance = Number(accountBalance) - Number(amount);
                console.log(newBalance)
                readData[account] = {
                    accountType: accountType,
                    accountBalance: newBalance
                }
                jsonData = JSON.stringify(readData, null, 2)

                fs.writeFile('./accounts.json', jsonData, function(err) {
                    if (err) {
                        console.log("error writing file")
                    }
                    console.log(jsonData)
                    res.redirect('/dashboard')
                })
            }

        })


    }
    // })
})

router.post('/return', function(req, res) {
    res.redirect('/dashboard')
})

function requireLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
};


module.exports = router;