const collection = require("./mongodb");
const express = require('express');
const router = express.Router();

const requireAuth = async (req, res, next) => {
    const userId = req.cookies.id;
    
    if (userId) {
        try {
            const user = await collection.findById(userId);
            
            if (user) {
               
                req.user = user;
                next();
            } else {
         
                res.redirect('/login');
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching user data' });
        }
    } else {
       
        res.redirect('/login');
    }
};

module.exports = requireAuth;
