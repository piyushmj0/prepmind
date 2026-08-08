const mongoose = require('mongoose');


/**
 * - job description: The job description for the interview report.
 * - resume text
 * - self description
 * 
 * - match score : Number
 * 
 * Technical questions: [{question: String,intention : string , answer: String}]
 * Behavioral skills: [{question: String,intention : string , answer: String}]
 * Skill gap : [{skill : "" , severity : "" , type: "" , enum [low, medium, high]}]
 * preparation plan : [{ day: number, focus : "", tasks :[string]}]
 */

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    intention: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}, { _id: false });

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    intention: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}, { _id: false });


const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    } 
}, { _id: false });


const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true
    },
    focus: {
        type: String,
        required: true
    },
    tasks: [{
        type: String,
        required: true
    }]
}, { _id: false });

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        
    },
    selfDescription: {
        type: String,
        
    },
    matchScore: {
        type: Number,
        min : 0,
        max : 100
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [ behavioralQuestionSchema ],    
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema]
},{
    timestamps: true
}); 

const interviewReportModel = mongoose.model('InterviewReport', interviewReportSchema);

module.exports = interviewReportModel;
