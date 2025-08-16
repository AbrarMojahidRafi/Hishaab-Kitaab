const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://HishaabKitaabAdmin:00PT1bYY7178PaO9@hishaabkitaab.tiyct8d.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection; 

db.on("error", function(err){
    console.log(err); 
})

db.on("open", function(){
    console.log("Connected to the database."); 
}) 

module.exports = db; 

