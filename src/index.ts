require('dotenv').config();
import express from 'express';
import http from 'http';
import cors from 'cors';

import mongoConnect from './database/mongo';
import userRoute from './routes/userRoute';
import sosRoute from './routes/sosRoute';
import bookingRoute from './routes/bookingRoute';
import chatRoute from './routes/chatRoute';
import serviceUserRoute from './routes/service/serviceUserRoute';

const app = express();
const server = http.createServer(app)

let port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use('/docs', express.static('apidoc'));


server.listen(port, () => {
    console.log(`Server started at port ${port}`);
    mongoConnect();
});

app.get("/",(req:any,res:any)=>{
    res.send("Server is UP!!!")
});

app.use('/v1/user', userRoute);
app.use('/v1/sos', sosRoute);
app.use('/v1/bookings', bookingRoute);
app.use('/v1/chat', chatRoute);
app.use('/v1/service-user', serviceUserRoute);
