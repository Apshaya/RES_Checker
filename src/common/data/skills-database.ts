// src/common/data/skills-database.ts

export interface SkillCategory {
  category: string;
  skills: string[];
  relatedRoles: string[];
}

export const SKILLS_DATABASE: SkillCategory[] = [
  {
    category: 'Frontend Development',
    skills: [
      'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Angular',
      'Vue.js', 'Redux', 'Webpack', 'Sass', 'Tailwind CSS', 'Bootstrap',
      'Next.js', 'Responsive Design', 'Web Accessibility'
    ],
    relatedRoles: ['Frontend Developer', 'UI Developer', 'Web Developer']
  },
  {
    category: 'Backend Development',
    skills: [
      'Node.js', 'NestJS', 'Express.js', 'Python', 'Django', 'Flask',
      'Java', 'Spring Boot', 'PHP', 'Laravel', 'Ruby on Rails',
      'RESTful APIs', 'GraphQL', 'Microservices', 'Authentication'
    ],
    relatedRoles: ['Backend Developer', 'API Developer', 'Software Engineer']
  },
  {
    category: 'Databases',
    skills: [
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite',
      'Oracle', 'SQL Server', 'Database Design', 'Query Optimization',
      'NoSQL', 'Cassandra', 'DynamoDB'
    ],
    relatedRoles: ['Database Administrator', 'Backend Developer', 'Data Engineer']
  },
  {
    category: 'DevOps & Cloud',
    skills: [
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud Platform',
      'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible',
      'Linux', 'Shell Scripting', 'Nginx', 'Monitoring'
    ],
    relatedRoles: ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer']
  },
  {
    category: 'Mobile Development',
    skills: [
      'React Native', 'Flutter', 'Swift', 'Kotlin', 'Android',
      'iOS', 'Xamarin', 'Mobile UI/UX', 'App Store Deployment',
      'Push Notifications', 'Offline Storage'
    ],
    relatedRoles: ['Mobile Developer', 'iOS Developer', 'Android Developer']
  },
  {
    category: 'Data Science & AI',
    skills: [
      'Python', 'R', 'Machine Learning', 'TensorFlow', 'PyTorch',
      'Scikit-learn', 'Pandas', 'NumPy', 'Data Visualization',
      'SQL', 'Statistics', 'Deep Learning', 'NLP', 'Computer Vision'
    ],
    relatedRoles: ['Data Scientist', 'ML Engineer', 'AI Researcher']
  },
  {
    category: 'Testing & QA',
    skills: [
      'Jest', 'Mocha', 'Cypress', 'Selenium', 'Pytest',
      'Unit Testing', 'Integration Testing', 'Test Automation',
      'Performance Testing', 'Security Testing', 'Bug Tracking'
    ],
    relatedRoles: ['QA Engineer', 'Test Automation Engineer', 'SDET']
  },
  {
    category: 'Soft Skills',
    skills: [
      'Communication', 'Leadership', 'Team Collaboration', 'Problem Solving',
      'Critical Thinking', 'Time Management', 'Adaptability',
      'Project Management', 'Agile/Scrum', 'Mentoring'
    ],
    relatedRoles: ['All Roles']
  },
  {
    category: 'Tools & Version Control',
    skills: [
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'JIRA', 'Confluence',
      'Slack', 'VS Code', 'IntelliJ IDEA', 'Postman', 'Figma'
    ],
    relatedRoles: ['All Technical Roles']
  }
];

export const EXPERIENCE_LEVELS = {
  entry: { min: 0, max: 2, label: 'Entry Level' },
  intermediate: { min: 2, max: 5, label: 'Intermediate' },
  senior: { min: 5, max: 10, label: 'Senior' },
  lead: { min: 10, max: 100, label: 'Lead/Principal' }
};

export function getSkillsByCategory(category: string): string[] {
  const found = SKILLS_DATABASE.find(
    db => db.category.toLowerCase() === category.toLowerCase()
  );
  return found ? found.skills : [];
}

export function getAllSkills(): string[] {
  return SKILLS_DATABASE.flatMap(db => db.skills);
}

export function findSkillCategory(skill: string): string | null {
  for (const db of SKILLS_DATABASE) {
    if (db.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      return db.category;
    }
  }
  return null;
}