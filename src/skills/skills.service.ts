// src/skills/skills.service.ts
import { Injectable } from '@nestjs/common';
import { NlpService } from '../common/nlp/nlp.service';
import {
  SKILLS_DATABASE,
  getAllSkills,
  findSkillCategory
} from '../common/data/skills-database';
import {
  INTERVIEW_QUESTIONS,
  getQuestionsBySkills,
  InterviewQuestion
} from '../common/data/interview-questions';

export interface SkillRecommendation {
  currentSkills: string[];
  recommendedSkills: {
    skill: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  learningResources: {
    skill: string;
    resources: string[];
  }[];
  careerPaths: string[];
}

export interface InterviewPreparation {
  skills: string[];
  questions: InterviewQuestion[];
  prepTips: string[];
  focusAreas: string[];
}

@Injectable()
export class SkillsService {
  constructor(private readonly nlpService: NlpService) {}

  /**
   * Get skill recommendations based on current skills
   */
  async getSkillRecommendations(
    currentSkillsText: string,
    targetRole?: string
  ): Promise<SkillRecommendation> {
    const currentSkills = this.nlpService.extractSkills(currentSkillsText);
    const recommendedSkills = this.generateSkillRecommendations(
      currentSkills,
      targetRole
    );
    const learningResources = this.getLearningResources(
      recommendedSkills.map(r => r.skill).slice(0, 5)
    );
    const careerPaths = this.suggestCareerPaths(currentSkills);

    return {
      currentSkills,
      recommendedSkills,
      learningResources,
      careerPaths
    };
  }

  /**
   * Get interview preparation based on skills
   */
  async getInterviewPreparation(
    skillsText: string,
    targetRole?: string
  ): Promise<InterviewPreparation> {
    const skills = this.nlpService.extractSkills(skillsText);
    const questions = getQuestionsBySkills(skills);
    
    // Add role-specific questions if target role provided
    if (targetRole) {
      const roleQuestions = this.getRoleSpecificQuestions(targetRole);
      questions.push(...roleQuestions);
    }

    // Ensure we have questions from all difficulty levels
    const prepTips = this.getInterviewPrepTips(skills, targetRole);
    const focusAreas = this.identifyFocusAreas(skills, questions);

    return {
      skills,
      questions: this.diversifyQuestions(questions).slice(0, 15),
      prepTips,
      focusAreas
    };
  }

  /**
   * Generate skill recommendations
   */
  private generateSkillRecommendations(
    currentSkills: string[],
    targetRole?: string
  ) {
    const recommendations: {
      skill: string;
      category: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
    }[] = [];

    const allAvailableSkills = getAllSkills();
    const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

    // Identify skill gaps
    SKILLS_DATABASE.forEach(category => {
      const hasSkillsInCategory = category.skills.some(skill =>
        currentSkillsLower.includes(skill.toLowerCase())
      );

      if (hasSkillsInCategory) {
        // Recommend complementary skills in same category
        category.skills.forEach(skill => {
          if (!currentSkillsLower.includes(skill.toLowerCase())) {
            recommendations.push({
              skill,
              category: category.category,
              priority: 'medium',
              reason: `Complements your existing ${category.category} skills`
            });
          }
        });
      }
    });

    // High priority recommendations based on common patterns
    if (currentSkillsLower.some(s => ['react', 'angular', 'vue'].includes(s))) {
      if (!currentSkillsLower.includes('typescript')) {
        recommendations.push({
          skill: 'TypeScript',
          category: 'Frontend Development',
          priority: 'high',
          reason: 'Essential for modern frontend development'
        });
      }
    }

    if (currentSkillsLower.some(s => ['nodejs', 'express', 'nestjs'].includes(s))) {
      if (!currentSkillsLower.some(s => ['mongodb', 'postgresql'].includes(s))) {
        recommendations.push({
          skill: 'PostgreSQL',
          category: 'Databases',
          priority: 'high',
          reason: 'Backend developers need database skills'
        });
      }
    }

    // Add testing if not present
    if (!currentSkillsLower.some(s => ['jest', 'testing', 'cypress'].includes(s))) {
      recommendations.push({
        skill: 'Jest (Unit Testing)',
        category: 'Testing & QA',
        priority: 'high',
        reason: 'Testing is crucial for software quality'
      });
    }

    // Add cloud skills if not present
    if (!currentSkillsLower.some(s => ['aws', 'azure', 'gcp'].includes(s))) {
      recommendations.push({
        skill: 'AWS',
        category: 'DevOps & Cloud',
        priority: 'medium',
        reason: 'Cloud skills are highly demanded in the industry'
      });
    }

    // Sort by priority and return top recommendations
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return recommendations
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 10);
  }

  /**
   * Get learning resources for skills
   */
  private getLearningResources(skills: string[]) {
    const resourceMap: Record<string, string[]> = {
      javascript: [
        'FreeCodeCamp - JavaScript Algorithms',
        'MDN Web Docs',
        'JavaScript.info'
      ],
      typescript: [
        'TypeScript Official Docs',
        'TypeScript Deep Dive (Book)',
        'Execute Program - TypeScript'
      ],
      react: [
        'React Official Tutorial',
        'Scrimba - Learn React',
        'Epic React by Kent C. Dodds'
      ],
      nodejs: [
        'Node.js Official Docs',
        'Node.js Design Patterns (Book)',
        'Learn Node by Wes Bos'
      ],
      python: [
        'Python.org Tutorial',
        'Automate the Boring Stuff with Python',
        'Real Python'
      ],
      docker: [
        'Docker Official Tutorial',
        'Docker for Beginners - FreeCodeCamp',
        'Play with Docker'
      ],
      aws: [
        'AWS Free Tier',
        'AWS Certified Cloud Practitioner',
        'A Cloud Guru'
      ]
    };

    return skills.map(skill => ({
      skill,
      resources: resourceMap[skill.toLowerCase()] || [
        `Search for "${skill} tutorial" on YouTube`,
        `Check Udemy for ${skill} courses`,
        `Visit official ${skill} documentation`
      ]
    }));
  }

  /**
   * Suggest career paths based on skills
   */
  private suggestCareerPaths(skills: string[]): string[] {
    const paths: string[] = [];
    const skillsLower = skills.map(s => s.toLowerCase());

    // Frontend path
    if (skillsLower.some(s => ['react', 'angular', 'vue', 'html', 'css'].includes(s))) {
      paths.push('Frontend Developer → Senior Frontend → Frontend Architect');
    }

    // Backend path
    if (skillsLower.some(s => ['nodejs', 'python', 'java', 'api'].includes(s))) {
      paths.push('Backend Developer → Senior Backend → Backend Architect');
    }

    // Full stack path
    if (
      skillsLower.some(s => ['react', 'angular', 'vue'].includes(s)) &&
      skillsLower.some(s => ['nodejs', 'python', 'java'].includes(s))
    ) {
      paths.push('Full Stack Developer → Senior Full Stack → Tech Lead');
    }

    // DevOps path
    if (skillsLower.some(s => ['docker', 'kubernetes', 'aws', 'cicd'].includes(s))) {
      paths.push('DevOps Engineer → Senior DevOps → DevOps Architect');
    }

    // Data path
    if (skillsLower.some(s => ['python', 'sql', 'machine learning'].includes(s))) {
      paths.push('Data Analyst → Data Scientist → ML Engineer');
    }

    return paths.length > 0 ? paths : [
      'Software Developer → Senior Developer → Tech Lead → Engineering Manager'
    ];
  }

  /**
   * Get interview preparation tips
   */
  private getInterviewPrepTips(skills: string[], targetRole?: string): string[] {
    const tips = [
      'Practice explaining your projects using the STAR method (Situation, Task, Action, Result)',
      'Review data structures and algorithms - they\'re common in technical interviews',
      'Prepare questions to ask the interviewer about the role and company',
      'Research the company thoroughly before the interview',
      'Practice coding problems on LeetCode or HackerRank'
    ];

    if (skills.some(s => ['react', 'angular', 'vue'].includes(s.toLowerCase()))) {
      tips.push('Be ready to discuss component lifecycle and state management');
      tips.push('Prepare to explain how you optimize frontend performance');
    }

    if (skills.some(s => ['nodejs', 'backend'].includes(s.toLowerCase()))) {
      tips.push('Review API design principles and RESTful conventions');
      tips.push('Be prepared to discuss database optimization and scaling');
    }

    return tips;
  }

  /**
   * Identify focus areas for interview prep
   */
  private identifyFocusAreas(
    skills: string[],
    questions: InterviewQuestion[]
  ): string[] {
    const categories = new Set(questions.map(q => q.category));
    const focusAreas: string[] = [];

    categories.forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const hardQuestions = categoryQuestions.filter(q => q.difficulty === 'hard');
      
      if (hardQuestions.length > 0) {
        focusAreas.push(
          `${category}: Focus on advanced concepts - ${hardQuestions.length} challenging questions identified`
        );
      }
    });

    return focusAreas.length > 0 ? focusAreas : [
      'General Technical Knowledge',
      'Problem Solving',
      'System Design Basics'
    ];
  }

  /**
   * Get role-specific questions
   */
  private getRoleSpecificQuestions(role: string): InterviewQuestion[] {
    const roleLower = role.toLowerCase();
    const questions: InterviewQuestion[] = [];

    if (roleLower.includes('frontend')) {
      questions.push(...INTERVIEW_QUESTIONS.filter(q => q.category === 'Frontend'));
    }

    if (roleLower.includes('backend')) {
      questions.push(...INTERVIEW_QUESTIONS.filter(q => q.category === 'Backend'));
    }

    if (roleLower.includes('full stack') || roleLower.includes('fullstack')) {
      questions.push(
        ...INTERVIEW_QUESTIONS.filter(q =>
          ['Frontend', 'Backend', 'System Design'].includes(q.category)
        )
      );
    }

    return questions;
  }

  /**
   * Diversify questions by difficulty and category
   */
  private diversifyQuestions(questions: InterviewQuestion[]): InterviewQuestion[] {
    const diversified: InterviewQuestion[] = [];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

    difficulties.forEach(difficulty => {
      const filtered = questions.filter(q => q.difficulty === difficulty);
      diversified.push(...filtered.slice(0, 5));
    });

    // Add any remaining unique questions
    questions.forEach(q => {
      if (!diversified.find(d => d.question === q.question)) {
        diversified.push(q);
      }
    });

    return diversified;
  }
}