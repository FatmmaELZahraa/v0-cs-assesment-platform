export const MCQ_PROMPT = (track: string, level: string, skills: string[], count: number) => `
You are a senior technical interviewer.

Generate ${count} multiple-choice questions for:
- Track: ${track}
- Level: ${level}

Focus on these skills:
${skills.map(s => `- ${s}`).join('\n')}

Rules:
- Each question tests ONE skill
- 4 options per question
- Only one correct answer
- Output valid JSON only

JSON format:
{
  "questions": [
    {
      "skill": "",
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "difficulty": "${level}"
    }
  ]
}
`;
