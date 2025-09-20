require('dotenv').config();
import express from 'express';
import http from 'http';
import cors from 'cors';
import db from './database/sqlConnect';
import userRoute from './routes/user';
import earningRoute from './routes/earnings';
import transactionRoute from './routes/transaction';


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
});

app.get("/",async(req:any,res:any)=>{
    try {
        const [rows] = await db.query('SELECT DATABASE() AS currentDatabase');        
        res.send(`DB connected! Test result: ${(rows as any)[0].currentDatabase}`);
    } catch (err: any) {
        res.status(500).send(`DB connection failed: ${err.message}`);
    }
});

app.use('/api/user', userRoute);
app.use('/api/earnings', earningRoute);
app.use('/api/transactions', transactionRoute);