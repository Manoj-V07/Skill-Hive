const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema( 
    {
        jobTitle : {
            type : String,
            required : true,
            trim : true,
        }, 
        jobDescription : {
            type : String,
            required : true,
            trim : true,
        },
        requiredSkills : {
            type : [String],
            required : true,
            validate : {
                validator : function(arr) {
                    return arr.length > 0;
                },
                message : 'At least one skill is required',
            }
        },
        experience : {
            type : Number,
            required : true,
            min : 0,
        },
        location : {
            type : String,
            required : true,
            trim : true,
        },
        jobType : {
            type : String,
            enum : ['Full-Time', 'Part-Time', 'Internship'],
            default : 'Full-Time',
            required : true,
        },
        createdBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'users',
            required : true,
        },
        vacancies: {
            type: Number,
            required: true,
            min: 1
        },
        isOpen : {
            type : Boolean,
            default : true,
        }
    },
    {
        timestamps : true,
    }
);

module.exports = mongoose.model('jobs',jobSchema)