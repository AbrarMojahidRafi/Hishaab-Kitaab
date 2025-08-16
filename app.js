const express = require("express");
const app = express();
const path = require("path"); 
const mongoose_connection = require("./config/mongoose");
const expressSession = require("express-session");

// models
const hishaabModel = require("./models/hishaab");
const {validateUserModel, newUserModel} = require("./models/newUser");
const {validateHishaabModel, HishaabModel} = require("./models/hishaab");
const { object } = require("joi");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(expressSession({
  secret: "random stuff",
  resave: false, 
  saveUninitialized: false
})); 

app.get("/", (req, res) => {
  // res.render("home"); // bortoman obosthay eti home e refer korteche. ekhon login er kaj ta kore eta ke fix kortechi. 

  // let's work on signin signup. 
  res.render("signin");
});

app.get("/signup", (req, res) => {
  res.render("signup");
  // amk ekhon signup form theke data gulo ke database e upload korte hobe. 
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.post("/signup-success", async function (req, res) {
  res.render("signup-success");

  // console.log(req.body); 
  // {
  //   name: 'Abrar Mojahid Rafi',
  //   email: 'rafi.cse.bracu@gmail.com',
  //   password: 'rafi.cse.bracu@gmail.com',
  //   confirm_password: 'rafi.cse.bracu@gmail.com',
  //   terms: 'on'
  // }

  const name = req.body["name"]; 
  const email = req.body["email"]; 
  const password = req.body["password"]; 
  const newUserRetypePassword = req.body["confirm_password"]; 

  // পাসওয়ার্ড মিলছে কিনা চেক
  if (password === newUserRetypePassword) {
    let data = {name, email, password};
    let error = validateUserModel(data); 
    if (error) return res.status(500).send(error.message);

    let createdNewUser = await newUserModel.create(data); 
    res.send(createdNewUser);
    // console.log(createdNewUser);
  }
});

app.get("/createNewHishaab", (req, res) => {
  res.render("createNewHishaab");
});

app.post("/home/createdNewHishaab", async function (req, res) {
  try {
    // 1. ভ্যালিডেশন চেক
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. ডেটা প্রস্তুত
    const data = {
      hishaabName: req.body.hishaab_name,
      hishaabDescription: req.body.hishaab_description,
      hishaab_creator: req.session.userId
    };

    // 3. ভ্যালিডেশন
    const error = validateHishaabModel(data);
    if (error) return res.status(400).send(error.message);

    // 4. ডেটাবেসে সেভ
    await HishaabModel.create(data);

    // 5. ইউজারের সব হিশাব নিয়ে হোম পেজ রেন্ডার
    const userAllHishaabs = await HishaabModel.find({ hishaab_creator: req.session.userId });
    res.render("home", {
      user: req.session.userId,
      userAllHishaabs: userAllHishaabs
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


app.get("/homepage/:hishaab_id", async function (req, res) {
  // user er joto gulo hishaab ache, shob gulo ekta array te kore pathaye dibo. 
  // console.log(req.params.hishaab_id);   // paichi ei hishaab_id ta. 
  const hishaab_obj = await HishaabModel.find({_id: req.params.hishaab_id});
  // console.log(hishaab_obj);
  // [
  //   {
  //     _id: new ObjectId('6893b9e5dcc058da0401a6d2'),
  //     hishaabName: 'rafiiiiiiiiiiii',
  //     hishaabDescription: 'rafuuuuuuuuuuuuuuu123456',
  //     hishaab_creator: '6892d229aea9854a9f183cdf',
  //     __v: 0
  //   }
  // ]
  // console.log(hishaab_obj[0].hishaab_creator);
  const userAllHishaabs = await HishaabModel.find({ hishaab_creator: hishaab_obj[0].hishaab_creator });
  // console.log(userAllHishaabs);
  res.render("home", {
    user: hishaab_obj[0].hishaab_creator, 
    userAllHishaabs: userAllHishaabs
  });
});

app.get("/homepage", async function (req, res) {
  res.render("home");
});



app.get("/profile", (req, res) => {
  res.render("profile");
});

app.get("/logout", (req, res) => {
  res.render("signin");
});

app.post("/home", async function (req, res, next){
  
  

  // res.render("home");  // eto easily home page e jaoya jabe na. 

  // jodi sign in kore, tahole home page e jabe. 
  // and ekta profile navbar er maddhome show korbe everything about that user. 

  // console.log(req.body);
  // {
  //   email: 'abrar.mojahid.rafi1@gmail.com',
  //   password: '=0uK}0wS$3eL^9',
  //   'remember-me': 'on'
  // } 

  const email = req.body["email"];
  const password = req.body["password"];

  // ami database e check korte chai email and password ta thik thak ache naki. 
  
  let getUser = await newUserModel.findOne({email: email, password: password});
  if (!getUser) return res.status(500).send("Invalid email or password");
  // console.log(getUser); 

  // user id collect korte hobe. 
  req.session.userId = getUser._id; // Using express-session

  // user er joto gulo hishaab ache, shob gulo ekta array te kore pathaye dibo. 
  const userAllHishaabs = await HishaabModel.find({ hishaab_creator: getUser._id });
  res.render("home", {
    user: getUser._id, 
    userAllHishaabs: userAllHishaabs
  });

  // // console.log(req.body);  // { hishab_name: 'rafi', hishab_description: 'asdfasdf' }
  // let hishaab_name = req.body.hishab_name; 
  // let hishaab_description = req.body.hishab_description;
  // // console.log(hishaab_name); // rafi 
  
  // // amake database e update korte hobe ei information gulo ...
  // // tobe tar age ami sign in, sign up er kaj ta kore feli... 
});



app.get("/hishaab/edit/:hishaab_id", async function (req, res) {
  // let hishaab = await HishaabModel.find({_id: req.params.hishaab_id});
  // req.session.userId = hishaab.hishaab_creator; // Using express-session
  // console.log("Edit page"); 
  // console.log(req.session.userId);
  res.render("edit", {
    hishaab_id: req.params.hishaab_id,
  });
});



app.post("/hishaab/delete/:hishaab_id", async function (req, res) {
  const hishaab_id = req.params.hishaab_id; 

  const hishaab_obj = await HishaabModel.find({_id: hishaab_id});
  // console.log(hishaab_obj);
  // [
  //   {
  //     _id: new ObjectId('6893b9e5dcc058da0401a6d2'),
  //     hishaabName: 'rafiiiiiiiiiiii',
  //     hishaabDescription: 'rafuuuuuuuuuuuuuuu123456',
  //     hishaab_creator: '6892d229aea9854a9f183cdf',
  //     __v: 0
  //   }
  // ]
  // console.log();
  const hishaab_creator_id = hishaab_obj[0].hishaab_creator;
  req.session.userId = hishaab_creator_id

  const deletedDocument = await HishaabModel.findByIdAndDelete(hishaab_id); 
  if (!deletedDocument) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  // res.status(200).json({ message: 'Document deleted successfully', deletedDocument });
  const userAllHishaabs = await HishaabModel.find({ hishaab_creator: hishaab_creator_id });
  // console.log(userAllHishaabs);
  res.render("home", {
    user: hishaab_obj[0].hishaab_creator, 
    userAllHishaabs: userAllHishaabs
  });

});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});