const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');


// Route 1: fetchallnotes of a user using get:/api/notes/fetchallnotes Login  required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error', error });
    }

})


//route 2:adding a note using post no login required
router.post('/addnote', fetchuser, [
    body('title').isLength({ min: 3 }).withMessage('title must be at least 3 characters long'),
    body('description').isLength({ min: 5 }).withMessage('description must be at least 5 characters long'),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id

        })
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error', error });
    }
})




// Route3: update an existing node using PUT:/api/notes/updatenote Login required

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        //create new note object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };



        //Find the node to be updated to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json("Not allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(note);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error', error });
    }
})





// Route4: delete an existing node using delete:/api/notes/deletenote Login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //create new note object
        const newNote = {};
        //Find the node to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not found");
        }
        //Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json("Not allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Sucess": "Note has been deleted", note });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error', error });
    }
})


module.exports = router;