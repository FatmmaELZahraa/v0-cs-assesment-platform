# Welcome page design

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/fatmmaelzahraas-projects/v0-algo-trading-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/vvjs3oM0G7d)

## Overview

📚 Training & Assessment Platform for Computer Science Students

This project is a training and assessment platform designed to help Computer Science students improve their technical skills through structured learning and real-time evaluation.

The platform allows users to select their preferred track and difficulty level, then automatically generates personalized questions to test their knowledge and problem-solving abilities. It provides instant feedback and performance analysis to support continuous learning and skill development.

🚀 Key Features

🎯 Track Selection
Users can choose their desired learning track such as:

Frontend Development

Backend Development

Game Development

Cyber Security

Flutter Development

Database

and more.

📊 Level-Based Learning
Students select their current level (Junior, Mid Level, Senior) to receive suitable challenges.

🧠 Dynamic Question Generation
The platform generates different types of questions including:

Multiple Choice Questions (MCQ)

Open-ended questions

Coding challenges

⚡ Automated Evaluation
The system evaluates answers and provides:

Correctness and scoring

Detailed feedback

Strengths and weaknesses

Recommendations for improvement

📈 Performance Analytics
Students can track their progress and monitor their skill growth over time.

🛠️ Tech Stack

Frontend: Next.js

Backend: NestJS

Database: MongoDB.

## Deployment

Your project is live at:

**[https://vercel.com/fatmmaelzahraas-projects/v0-algo-trading-platform](https://vercel.com/fatmmaelzahraas-projects/v0-algo-trading-platform)**



## How It Works 

1. Front End run with npm run dev
2. Back End cd assesment , npm run start : dev
3. to test generation of questions  on Postman/thunder client   New Request -> Get -> Querey Params track  backend  level  junior  ->http://localhost:5000/assessment/generate?track=backend&level=junior
4. to test submit Post->http://localhost:5000/assessment/submit-> Body Jison as
  
6. {
  "originalAssessment": {
    "mcqs": [
      { "question": "Which of the following best describes the concept of Polymorphism...", "answer": "A) The ability of an object to take on many forms." },
      { "question": "Which HTTP method is generally considered idempotent?", "answer": "B) PUT" },
      { "question": "In SQL, which keyword is used to retrieve only unique values...", "answer": "B) DISTINCT" }
    ],
    "openEnded": [
      { "question": "Describe a common error handling strategy...", "modelAnswer": "A common error handling strategy involves using a centralized error middleware..." },
      { "question": "Explain the purpose of Git branches...", "modelAnswer": "Git branches allow developers to work on features in isolation..." }
    ],
    "coding": {
      "title": "Product Inventory Aggregator",
      "description": "Calculate total value of products for each category...",
      "constraints": ["price will always be a non-negative number"]
    }
  },
  "userAnswers": {
    "mcqs": [
      "A) The ability of an object to take on many forms.",
      "B) PUT",
      "B) DISTINCT"
    ],
    "openEnded": [
      "I would implement a global exception handler or middleware to catch all errors, log them for debugging, and return a standard JSON response with 4xx or 5xx status codes.",
      "Git branches are used for isolating new features or bug fixes. Developers create a branch, commit changes, and merge it back to the main branch after a review."
    ],
    "coding": [
      "function aggregateInventoryValue(products) { const total = {}; products.forEach(p => { total[p.category] = (total[p.category] || 0) + p.price; }); return total; }"
    ]
  }
}
