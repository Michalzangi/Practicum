const express = require('express');

const app = express();
const port = 4000;

const { loginUser } = require('../model/mongoDB');
const { addNewFlight } = require('../model/mongoDB');
const { getFlight } = require('../model/mongoDB');
const { updateFlight } = require('../model/mongoDB');
const { updateAllFlight } = require('../model/mongoDB');
const { addNewOpinion } = require('../model/mongoDB');
const { getOpinion } = require('../model/mongoDB');
const { addNewUser } = require('../model/mongoDB');
const { deleteExistingUser } = require('../model/mongoDB');
const { getUser } = require('../model/mongoDB');
const { addNewCoupon } = require('../model/mongoDB');
const { getCoupon } = require('../model/mongoDB');
const { getLastItem } = require('../model/mongoDB');

const nodemailer = require('nodemailer');

app.use(express.static('public'));
app.use(express.json()); 


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

