const mongoose = require('mongoose');

const userSchema = new mongoose.Schema( 
    {
        username : {
            type : String,
            required : true,
        },
        password : {
            type : String,
            required : true,
            minlength : 6,
        },
        email : {
            type : String,
            required : true,
            unique : true,
            trim : true,
        },
        role : {
            type : String,
            enum : ['admin' , 'hr' , 'candidate'],
            default : 'candidate',
        },
        isApproved: {
            type: Boolean,
            default: function () {
                return this.role !== 'hr';
            },
        },
    },
    {
        timestamps : true,
    }
)

module.exports = mongoose.model('users',userSchema)