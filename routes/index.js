



var express = require('express');

var router = express.Router();
const collection = require("../mongodb");

const bcrypt = require('bcryptjs');

var cookieParser = require('cookie-parser');
const requireAuth =require("../auth");







router.get("/", (req, res) => {
  res.render("index")
});


router.get("/signup", (req, res) => {
  res.render("signup");
});


router.post("/submit", async (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  };


  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword;

    await collection.insertMany([data]);

    res.render("index");
  } catch (error) {
    console.error('Error hashing the password:', error);
    res.status(500).send('Internal Server Error');
  }
});





// login

router.post("/login", async (req, res) => {
  try {
    console.log('email:', req.body.email);
    console.log('Password:', req.body.password);

    const user = await collection.findOne({ email: req.body.email });

    if (user) {   
      const passwordMatch = await bcrypt.compare(req.body.password, user.password);

      if (passwordMatch) {
      
        const userIdString = user._id.toString();

        res.cookie('id', userIdString, {
          maxAge: 1000000000000000, // ms
          httpOnly: true,
          secure: true,
        });

        res.redirect("home");
      } else {
        res.send("Wrong password");
      }
    } else {
    
      res.send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.render("error");
  }
});




// **************************************************************************************************************************************************



// Home route
router.get('/home', requireAuth, async (req, res) => {
 
  try {
    console.log('Session User ID:', req.cookies.id);
    const user = req.user;
    console.log('User Object:', user );

    if (!user) {
      return res.status(404).send('User not found');
    }

   
const userDetails = user ? { email: user.email, name: user.name } : null;


res.render('home', { user: userDetails });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving user data');
  }
});










router.get('/edit', async (req, res) => {
  try {
  
    const userId = req.cookies.id;

    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    
    const user = await collection.findById(userId);

   
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

 
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user data for editing' });
  }
});


router.put('/edit', async (req, res) => {
  try {
 
    const userId = req.cookies.id;

  
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const updatedUser = await collection.findByIdAndUpdate(
      userId, 
      {
        name: req.body.name,
        email: req.body.email,
      },
      { new: true }
     
    ); 

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
    
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user data' });
  }
});


router.get("/close" , (req,res) =>{
  res.redirect ("home");
})



// *****************************************************************************************************************************************************




// Logout route
router.get('/logout', (req, res) => {

  res.clearCookie('id', {
    httpOnly: true,
    secure: true,
  });
  res.redirect("/") 
});



// delete
// ********

router.delete('/delete/', async (req, res) => {
  try {
    const userId = req.cookies.id;
    const deletedUser = await collection.findByIdAndRemove(userId);
    if (!deletedUser) { 
     
      return res.status(404).json({ message: 'User not found' });
    }
    
   
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user data' });
  }
});

router.get("/delete" , (req,res) =>{
  res.redirect ("/");
})

module.exports = router;



