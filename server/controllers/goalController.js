import Goal from '../models/Goal.js';

export const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching goals' });
    }
};

export const createGoal = async (req, res) => {
    try {
        const { name, targetAmount, currentAmount, monthlyContribution, deadline } = req.body;
        const goal = await Goal.create({
            userId: req.user.id,
            name,
            targetAmount,
            currentAmount: currentAmount || 0,
            monthlyContribution: monthlyContribution || 0,
            deadline
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error creating goal' });
    }
};

export const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error updating goal' });
    }
};

export const deleteGoal = async (req, res) => {
    try {
        await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Goal removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting goal' });
    }
};
