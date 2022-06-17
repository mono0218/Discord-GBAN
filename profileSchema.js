const mongoose = require('mongoose'); //mongoDBを使用するためのおまじない

const profileSchema = new mongoose.Schema({
    use: { type: String },
    name: { type: String }, //ユーザーネーム
    why: { type: String }, //アバター
});

const model = mongoose.model('Profiles', profileSchema);

module.exports = model;