const mongoose = require('mongoose');

mongoose.connect(`${process.env.MONGODB_URL}`,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
    console.log("Successfully Connected ! ")
}).catch((e) => {
    console.log("Error = ",e);
});