require('dotenv').config();
import express from 'express';
import http from 'http';
import cors from 'cors';

import mongoConnect from './database/mongo';

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