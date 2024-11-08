const express = require('express');
const mongoose=require("mongoose");
const path = require('path');
const userModels = require("./models/user");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const postModel = require('./models/post'); // Assuming your model file is named post.js
const post = require('./models/post');
const multer  = require('multer');
const crypto= require('crypto');
const newsData = require('./news.json');
// const upload = require("./config/multerconfig");

const app = express();
//map integration
const http=require("http");
const socketio=require("socket.io");
const server=http.createServer(app);
const io=socketio(server);
//map integeration part
const userModel = require('./models/user');
const cookieParser = require('cookie-parser');
const Contact = require('./models/contact');
mongoose.connect('mongodb://localhost:27017/adhivira', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

io.on("connection",function(socket){
    socket.on("send-location",function(data){
        io.emit("receive-location",{id:socket.id,...data});
    });
    console.log("connected!");

    socket.on("disconnect",function(){
        io.emit("user-disconnected",socket.id);
    });
});
//map rendering
app.get("/liveLocation",function(req,res){
    res.render("liveLocation");
});
app.get("/transport",function(req,res){
    res.render("transport");
});
app.get('/news', (req, res) => {
    res.json(newsData);
});
app.get('/news', (req, res) => {
    // Read the news.json file
    fs.readFile(path.join(__dirname, 'news.json'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).send('Error reading the news file');
      }
      
      // Parse the JSON data and send it as the response
      res.json(JSON.parse(data));
    });
  });
// Basic Routes
app.get('/', (req, res) => res.render('index'));
app.get('/safety', (req, res) => res.render('safety'));
app.get('/signin', (req, res) => res.render('signin'));
app.get('/contacts/new', (req, res) => res.render('contacts/new'));
app.get('/products/index', (req, res) => res.render('products/index'));
// Predefined contacts
const contacts = [
    { name: "Alice Johnson", phone: "123-456-7890" },
    { name: "Bob Smith", phone: "987-654-3210" },
    { name: "Charlie Brown", phone: "555-555-5555" },
];

// Route for tip2
app.get('/tips/tip2', (req, res) => {
    res.render('tips/tip2', { contacts });
});


// Route to display all contacts
app.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.render('contacts/saveContact', { contacts }); // Render to saveContact.ejs
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).send("Error fetching contacts");
    }
});

// Route to handle contact creation
app.post('/contacts', async (req, res) => {
    const { name, phone, email } = req.body;
    try {
        const newContact = new Contact({ name, phone, email });
        await newContact.save();
        res.redirect('/contacts');  // Redirect to the contacts route which renders saveContact.ejs
    } catch (error) {
        console.error("Error saving contact:", error);
        res.status(500).send("Error saving contact");
    }
});


//puchase start
app.get('/purchase/:productId', (req, res) => {
    const productId = req.params.productId;
    // Render a purchase confirmation page or handle the purchase logic
    res.render('purchase', { productId });
});

//purchase end
//premium start
app.get('/premium/feature', (req, res) => {
    res.render("premium/feature");
});

// Routes for the different feature pages
app.get('/', (req, res) => {
    res.render('index'); // Render a page for Basic Features
});

app.get('/premium-features', (req, res) => {
    res.render('premiumFeatures'); // Render a page for Premium Features
});

app.get('/choose-free', (req, res) => {
    res.render('chooseFree'); // Render a confirmation page for free choice
});

app.get('/premium/upgrade-now', (req, res) => {
    res.render('premium/upgrade-now'); // Render a confirmation or upgrade page
});

//premium ends
app.get('/newPremium', (req, res) => {
    res.render("newPremium");
});

//post starts
app.get('/post/index', (req, res) => {
    res.render("post/index");
});

// app.get('/profile/upload', (req, res) => {
//     res.render("profileupload");
// });

// app.post('/upload', isLoggedIn, upload.single("image"), async (req, res) => {
//    let user = await userModel.findOne({email: req.user.email});
//    user.profilepic= req.file.filename;
//    user.save();
//    res.redirect("/profile");
//     console.log(req.file);
// });



app.get("/post/test",(req, res) => {
    res.render("post/test");
});

// app.post("/uploade", upload.single("image"), (req, res) => {
//     console.log(req.file);

// });

app.get('/post/login', (req, res) => {
    res.render("post/login");
});
app.get('/profile', isLoggedIn, (req, res) => {
    res.redirect('/post/profile');
});


app.get('/post/profile', isLoggedIn, async (req, res) => {
    let user= await userModel.findOne({email: req.user.email}).populate("posts");
    res.render("post/profile", { user });

});

app.get('/like/:id', isLoggedIn, async (req, res) => {
    let post= await postModel.findOne({_id: req.params.id}).populate("user");

    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    
        await post.save();
    res.redirect("/post/profile");

});


app.get('/post/edit/:id', isLoggedIn, async (req, res) => {
    let post= await postModel.findOne({_id: req.params.id}).populate("user");

   res.render("post/edit", {post});

});

app.post('/update/:id', isLoggedIn, async (req, res) => {
    let post= await postModel.findOneAndUpdate({_id: req.params.id},{content: req.body.content});


   res.redirect("post/profile");

});

app.post("/post", isLoggedIn, async (req, res) => {
    let user= await userModel.findOne({email: req.user.email});
    let {content} =req.body;

    let post= await postModel.create({
        user: user._id,
        content
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("post/profile");

});

app.post('/register', async (req, res) => {
    try {
        let { email, password, username, name, age } = req.body;
        let user = await userModel.findOne({ email });
        if (user) return res.status(500).send("User already registered");

        bcrypt.genSalt(10, (err, salt) => {
            if (err) return res.status(500).send("Error in registration");

            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.status(500).send("Error in registration");

                let newUser = await userModel.create({
                    username,
                    email,
                    age,
                    name,
                    password: hash
                });

                let token = jwt.sign({ email: email, userid: newUser._id }, "shhhh");
                res.cookie("token", token);
                res.send("Registered successfully");
            });
        });
    } catch (error) {
        res.status(500).send("Server error");
    }
});

app.post('/post/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await userModel.findOne({ email });
        if (!user) return res.status(500).send("Invalid credentials");

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return res.status(500).send("Error in login");

            if (result) {
                let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
                res.cookie("token", token);
                res.status(200).redirect("/profile");
            } else {
                res.redirect("post/login");
            }
        });
    } catch (error) {
        res.status(500).send("Server error");
    }
});

app.get('/post/logout', (req, res) => {
    res.cookie("token", "", { maxAge: 1 });
    res.redirect("/post/login");
});

function isLoggedIn(req, res, next) {
    if (!req.cookies.token || req.cookies.token === "") {
         res.redirect("/post/login");
    } else {
        try {
            let data = jwt.verify(req.cookies.token, "shhhh");
            req.user = data;
            next();
        } catch (error) {
            return res.send("Invalid token");
        }
    }
}

//post ends

// Sample cart data and routes
let cart = {
    items: [
        { productId: { name: "Product A" }, quantity: 2 },
        { productId: { name: "Product B" }, quantity: 1 }
    ],
    totalQuantity: 3,
    totalPrice: 45.00
};

app.get('/cart', (req, res) => res.render('cart/index', { cart }));

app.post('/cart/clear', (req, res) => {
    cart = {
        items: [],
        totalQuantity: 0,
        totalPrice: 0
    };
    res.redirect('/cart');
});

server.listen(3000, () => console.log('Server is running on http://localhost:3000'));
