import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';

import userRoutes from './routes/user';
import postRoutes from './routes/post';

dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(() => {
  console.log('connected to Mongo');
}).catch((err) => {
  console.log(err);
})

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({origin: true, credentials: true}));
app.use(morgan('dev'));

app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Server is running on ' + port);
});