import mongoose from "mongoose";
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    key: String,
    bucket: String,
    location: String,
    etag: String
});

const Image = mongoose.model("Image", imageSchema);

export default Image;
