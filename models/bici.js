const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usrSchema = new Schema({

	codigo:{
		type: String,
		required:true,
	},
	estacion:{
		type: String,
		required:true
    }
	
}, { timestamps: true } ).set('toJSON',{
    transform: (document, object) => {
        object.id = document.id;
        delete object._id;
        delete object.password;
    }
});


const Usr = mongoose.model('usr',usrSchema);
module.exports = Usr;