export const ESSAY_PROMPT = (track: string, level: string, skills: string[]) => `
You are a senior technical interviewer.

Generate 1 essay question for:
- Track: ${track}
- Level: ${level}

Focus on these skills:
${skills.map(s => `- ${s}`).join('\n')}

Rules:
- Question should test deep understanding
- Include evaluation criteria
- JSON format only:

{
  "question": "",
  "expectedPoints": ["", "", ""],
  "maxScore": 10,
  "difficulty": "${level}"
}
`;
