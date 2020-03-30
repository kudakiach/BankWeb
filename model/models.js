var mongoose = require('mongoose');



mongoose.Promise = global.Promise;
const dbURI = 'mongodb+srv://root:abcd1234@myapp-prthu.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
        /* other options */
});


mongoose.connection.once('open', () => {
    console.log(`Mongoose connected to ${dbURI}`);
}).on("error", function(error) {
    console.log("Connection Error", error)
});


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
module.exports = mongoose.model('clientCollection', accountSchema);