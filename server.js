import http from 'http'
import app from "./app/app.js"
import mongoose from 'mongoose'


// create the server
const PORT = process.env.PORT || 2030
const server = http.createServer(app)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});