// src/common/data/interview-questions.ts

export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // JavaScript/TypeScript
  {
    question: 'Explain the difference between var, let, and const in JavaScript.',
    category: 'JavaScript',
    difficulty: 'easy',
    skills: ['JavaScript', 'TypeScript']
  },
  {
    question: 'What is closure in JavaScript? Provide an example.',
    category: 'JavaScript',
    difficulty: 'medium',
    skills: ['JavaScript']
  },
  {
    question: 'Explain the event loop in Node.js and how it handles asynchronous operations.',
    category: 'JavaScript',
    difficulty: 'hard',
    skills: ['Node.js', 'JavaScript']
  },
  
  // React
  {
    question: 'What are React Hooks and why were they introduced?',
    category: 'Frontend',
    difficulty: 'medium',
    skills: ['React']
  },
  {
    question: 'Explain the difference between useEffect and useLayoutEffect.',
    category: 'Frontend',
    difficulty: 'hard',
    skills: ['React']
  },
  {
    question: 'How would you optimize the performance of a React application?',
    category: 'Frontend',
    difficulty: 'hard',
    skills: ['React', 'Performance']
  },

  // Backend
  {
    question: 'What is the difference between SQL and NoSQL databases? When would you use each?',
    category: 'Backend',
    difficulty: 'medium',
    skills: ['Databases', 'MongoDB', 'SQL']
  },
  {
    question: 'Explain RESTful API design principles and best practices.',
    category: 'Backend',
    difficulty: 'medium',
    skills: ['REST API', 'Backend']
  },
  {
    question: 'How would you implement authentication and authorization in a NestJS application?',
    category: 'Backend',
    difficulty: 'hard',
    skills: ['NestJS', 'Security', 'Authentication']
  },

  // System Design
  {
    question: 'Design a URL shortening service like bit.ly.',
    category: 'System Design',
    difficulty: 'hard',
    skills: ['System Design', 'Databases', 'Backend']
  },
  {
    question: 'How would you handle rate limiting in a REST API?',
    category: 'System Design',
    difficulty: 'medium',
    skills: ['API Design', 'Backend']
  },

  // DevOps
  {
    question: 'Explain the benefits of containerization with Docker.',
    category: 'DevOps',
    difficulty: 'easy',
    skills: ['Docker', 'DevOps']
  },
  {
    question: 'What is CI/CD and how would you implement it?',
    category: 'DevOps',
    difficulty: 'medium',
    skills: ['CI/CD', 'DevOps']
  },

  // Data Structures & Algorithms
  {
    question: 'Implement a function to reverse a linked list.',
    category: 'Algorithms',
    difficulty: 'medium',
    skills: ['Data Structures', 'Algorithms']
  },
  {
    question: 'Find the first non-repeating character in a string.',
    category: 'Algorithms',
    difficulty: 'easy',
    skills: ['Algorithms', 'Problem Solving']
  },

  // Behavioral
  {
    question: 'Tell me about a time when you had to debug a difficult production issue.',
    category: 'Behavioral',
    difficulty: 'medium',
    skills: ['Problem Solving', 'Communication']
  },
  {
    question: 'Describe a situation where you had to work with a difficult team member.',
    category: 'Behavioral',
    difficulty: 'medium',
    skills: ['Communication', 'Team Collaboration']
  },
  {
    question: 'How do you prioritize tasks when working on multiple projects?',
    category: 'Behavioral',
    difficulty: 'easy',
    skills: ['Time Management', 'Project Management']
  },

  // General Technical
  {
    question: 'What is your approach to writing clean, maintainable code?',
    category: 'General',
    difficulty: 'medium',
    skills: ['Best Practices', 'Code Quality']
  },
  {
    question: 'How do you stay updated with new technologies and trends?',
    category: 'General',
    difficulty: 'easy',
    skills: ['Learning', 'Adaptability']
  }
];

export function getQuestionsBySkills(skills: string[]): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter(q =>
    q.skills.some(skill =>
      skills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || 
                       skill.toLowerCase().includes(s.toLowerCase()))
    )
  );
}

export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter(q => q.difficulty === difficulty);
}

export function getQuestionsByCategory(category: string): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter(q => 
    q.category.toLowerCase() === category.toLowerCase()
  );
}