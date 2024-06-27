const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const postSchema = new moongose.Schema({
    user: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,

    },
    img: {
        type: String,

    },
    likes: [
        {
            type: moongose.Schema.Types.ObjectId,
            ref: 'User',

        }
    ],
    comment: [
        {
            text: {
                type: String,
                required: true
            },
            user: {
                type: moongose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        }
    ],
}, { timestamps: true })

const Post=mongoose.model("Post",postSchema)

module.exports=Post