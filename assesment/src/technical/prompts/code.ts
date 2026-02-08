export const CODE_PROMPT = (track: string, level: string, skills: string[], language: string) => `
You are a senior software engineer creating a coding challenge.

Create 1 coding problem for:
- Track: ${track}
- Level: ${level}
- Language: ${language}

Focus on these skills:
${skills.map(s => `- ${s}`).join('\n')}

Rules:
- Include input/output format
- Include at least 3 test cases
- Do not provide solution
- JSON format only:

{
  "title": "",
  "description": "",
  "inputFormat": "",
  "outputFormat": "",
  "constraints": "",
  "testCases": [{"input": "", "output": ""}],
  "difficulty": "${level}",
  "language": "${language}"
}
`;
