const PaperPresentation = require('../models/paperPresentationModel');
const upload = require('../middleware/upload');

const createPaper = async (req, res) => {
    try {
        const { userId, department, topic } = req.body;
        const newPaper = new PaperPresentation({
            userId,
            department,
            topic,
            // paperFile: req.file.path
        });
        await newPaper.save();
        res.status(201).json(newPaper);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllPapers = async (req, res) => {
    try {
        const papers = await PaperPresentation.find().populate('userId', 'username email');
        res.json(papers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getPaperById = async (req, res) => {
    try {
        const paper = await PaperPresentation.findById(req.params.id).populate('userId', 'username email');
        if (!paper) {
            return res.status(404).json({ error: 'Paper presentation not found' });
        }
        res.json(paper);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updatePaperStatus = async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const paper = await PaperPresentation.findByIdAndUpdate(
            req.params.id,
            { status, feedback },
            { new: true }
        );
        if (!paper) {
            return res.status(404).json({ error: 'Paper presentation not found' });
        }
        res.json(paper);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const filterPapers = async (req, res) => {
    try {
        const { department, status } = req.query;
        const filterOptions = {};

        if (department) {
            filterOptions.department = department;
        }

        if (status) {
            filterOptions.status = status;
        }

        const papers = await PaperPresentation.find(filterOptions).populate('userId', 'username email');
        res.json(papers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createPaper, getAllPapers, getPaperById, updatePaperStatus, filterPapers };