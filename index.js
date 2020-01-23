const express = require('express');
const db = require('./data/db.js');

const server = express();
const port = process.env.PORT || 4000;
server.listen(port, () => {
    console.log(`=== listening on port ${port} ===`);
});

server.use(express.json());

//-----------------------------------------------------------------------------
// Creates a user using the information sent inside the `request body`.
//-----------------------------------------------------------------------------
// Clean and working
// server.post('/api/users', (req, res) => {
//   const user = req.body;
//   if(!user.name || !user.bio) {
//     res.status(400).json({ errorMessage: "Please provide name and bio for the user." });
//   } else {
//     db.insert(user)
//         .then(id => {
//           res.status(201).json(id);
//         })
//         .catch(err => {
//           res.status(500).json({ errorMessage: "There was an error while saving the user to the database" });
//         });
//   }
// });
//
// UGGO! 
server.post('/api/users', async (req, res) => {
    const user = req.body;
    if(!user.name || !user.bio) {
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." });
    } else {
        try {
            const dbRes = await db.insert(user);
            const user = await db.findById(dbres.id);
            res.status(201).json(user);
        } catch (err) {
            res.status(500).json({ errorMessage: "There was an error while saving the user to the database" });
        }
    }

    //     db.insert(user)
    //             .then(dbRes => {
    //                 db.findById(dbRes.id)
    //                         .then(user => {
    //                             res.status(201).json(user);
    //                         })
    //                         .catch(err => {
    //                             res.status(500).json({ errorMessage: "There was an error while saving the user to the database" });
    //                         });
    //             })
    //             .catch(err => {
    //                 res.status(500).json({ errorMessage: "There was an error while saving the user to the database" });
    //             });
});

//-----------------------------------------------------------------------------
// Returns an array of all the user objects contained in the database.
//-----------------------------------------------------------------------------

server.get('/api/users', (req,res) => {
    db.find()
            .then(users => {
                res.status(200).json(users);
            })
            .catch(err => {
                res.status(500).json({ errorMessage: "The users information could not be retrieved." });
            });
});

//-----------------------------------------------------------------------------
// Returns the user object with the specified `id`.
//-----------------------------------------------------------------------------

server.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.findById(id)
            .then(user => {
                if (typeof user === "object") {
                    res.status(200).json(user);
                } else {
                    res.status(404).json({ message: "The user with the specified ID does not exist." });
                }
            })
            .catch(err => {
                res.status(500).json({ errorMessage: "The users information could not be retrieved." });
            });
});

//-----------------------------------------------------------------------------
// Removes the user with the specified `id` and returns the deleted user.
//-----------------------------------------------------------------------------

server.delete('/api/users/:id', async(req, res) => {
    const { id } = req.params;
    db.findById(id)
            .then(user => {
                if (typeof user === "object") {
                    db.remove(id)
                            .then(dbRes => { 
                                dbRes ? 
                                res.status(200).json(user) : 
                                res.status(404).json({ message: "The user with the specified ID does not exist." });
                            })
                            .catch(err => {
                                res.status(500).json({ errorMessage: "The user could not be removed" });
                            });
                } else {
                    res.status(404).json({ message: "The user with the specified ID does not exist." });
                }
            })
            .catch(err => {
                res.status(500).json()
            })
});

//-----------------------------------------------------------------------------
// Updates the user with the specified `id` and returns the modified user.
//-----------------------------------------------------------------------------

server.put('/api/users/:id', async (req,res) => {
    const { id } = req.params;
    const changes = req.body;
    if (!changes.name | !changes.bio) {
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." });
    } else {
        try {
            const updated = await db.update(id, changes);
            if (updated) {
                const user = await db.findById(id);
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: "The user with the specified ID does not exist." });
            }
        } catch (err) {
            res.status(500).json({ errorMessage: "The user information could not be modified." });
        }
    }
        // db.update(id, changes)
        //         .then(updated => {
        //             if (updated) {
        //                 db.findById(id)
        //                         .then(user => {
        //                             res.status(200).json(user);
        //                         })
        //                         .catch(err => {
        //                             res.status(500).json({ errorMessage: "The user information could not be modified." });          
        //                         });
        //             } else
        //                 res.status(404).json({ message: "The user with the specified ID does not exist." });
        //         })
        //         .catch(err => {
        //             res.status(500).json({ errorMessage: "The user information could not be modified." });
        //         });
});