const moment = require('moment');

var generateMsg=(from,text)=>{return {from,text,createdAt:moment().valueOf()}};
module.exports={generateMsg};