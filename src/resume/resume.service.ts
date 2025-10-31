// src/resume/resume.service.ts
import { Injectable } from '@nestjs/common';
import { NlpService } from '../common/nlp/nlp.service';
import { SKILLS_DATABASE, getAllSkills } from '../common/data/skills-database';

export interface ResumeAnalysis {
  overallScore: number;
  sections: {
    found: string[];
    missing: string[];
    recommendations: string[];
  };
  skills: {
    found: string[];
    suggested: string[];
    byCategory: Record<string, string[]>;
  };
  experience: {
    years: number;
    level: string;
  };
  keywords: string[];
  sentiment: {
    score: number;
    assessment: string;
    feedback: string;
  };
  improvements: string[];
}

@Injectable()
export class ResumeService {
  constructor(private readonly nlpService: NlpService) {}

  /**
   * Main method to analyze resume
   */
  async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    // Extract all components
    const sections = this.analyzeSections(resumeText);
    const skills = this.analyzeSkills(resumeText);
    const experience = this.analyzeExperience(resumeText);
    const keywords = this.nlpService.extractKeywords(resumeText, 15);
    const sentiment = this.analyzeSentiment(resumeText);
    const improvements = this.generateImprovements(sections, skills, experience, sentiment);

    // Calculate overall score (0-100)
    const overallScore = this.calculateOverallScore(sections, skills, experience, sentiment);

    return {
      overallScore,
      sections,
      skills,
      experience,
      keywords,
      sentiment,
      improvements
    };
  }

  /**
   * Analyze resume sections
   */
  private analyzeSections(resumeText: string) {
    const extractedSections = this.nlpService.extractSections(resumeText);
    
    const requiredSections = [
      'contact', 'summary', 'experience', 'education', 'skills'
    ];
    
    const recommendedSections = [
      'projects', 'certifications', 'achievements'
    ];

    const found: string[] = [];
    const missing: string[] = [];
    const recommendations: string[] = [];

    // Check required sections
    requiredSections.forEach(section => {
      if (extractedSections[section]) {
        found.push(section);
      } else {
        missing.push(section);
        recommendations.push(
          `Add a ${section} section - this is essential for a complete resume`
        );
      }
    });

    // Check recommended sections
    recommendedSections.forEach(section => {
      if (extractedSections[section]) {
        found.push(section);
      } else {
        recommendations.push(
          `Consider adding a ${section} section to strengthen your resume`
        );
      }
    });

    return { found, missing, recommendations };
  }

  /**
   * Analyze skills in resume
   */
  private analyzeSkills(resumeText: string) {
    const foundSkills = this.nlpService.extractSkills(resumeText);
    const allAvailableSkills = getAllSkills();
    
    // Categorize found skills
    const byCategory: Record<string, string[]> = {};
    SKILLS_DATABASE.forEach(category => {
      const categorySkills = foundSkills.filter(skill =>
        category.skills.some(s => 
          s.toLowerCase() === skill.toLowerCase()
        )
      );
      if (categorySkills.length > 0) {
        byCategory[category.category] = categorySkills;
      }
    });

    // Suggest complementary skills
    const suggested: string[] = [];
    
    // If they have frontend skills, suggest related ones
    if (foundSkills.some(s => ['react', 'angular', 'vue'].includes(s.toLowerCase()))) {
      if (!foundSkills.some(s => s.toLowerCase().includes('typescript'))) {
        suggested.push('TypeScript');
      }
      if (!foundSkills.some(s => s.toLowerCase().includes('testing'))) {
        suggested.push('Jest or Cypress (Testing)');
      }
    }

    // If they have backend skills
    if (foundSkills.some(s => ['nodejs', 'python', 'java'].includes(s.toLowerCase()))) {
      if (!foundSkills.some(s => ['mongodb', 'postgresql', 'mysql'].includes(s.toLowerCase()))) {
        suggested.push('Database skills (MongoDB/PostgreSQL)');
      }
      if (!foundSkills.some(s => s.toLowerCase().includes('docker'))) {
        suggested.push('Docker (Containerization)');
      }
    }

    // General suggestions
    if (foundSkills.length < 5) {
      suggested.push('Add more technical skills relevant to your target role');
    }

    if (!foundSkills.some(s => s.toLowerCase().includes('git'))) {
      suggested.push('Git (Version Control) - Essential for developers');
    }

    return {
      found: foundSkills,
      suggested,
      byCategory
    };
  }

  /**
   * Analyze experience level
   */
  private analyzeExperience(resumeText: string) {
    const years = this.nlpService.extractExperience(resumeText);
    
    let level = 'Entry Level';
    if (years >= 10) level = 'Lead/Principal';
    else if (years >= 5) level = 'Senior';
    else if (years >= 2) level = 'Intermediate';

    return { years, level };
  }

  /**
   * Analyze sentiment and language quality
   */
  private analyzeSentiment(resumeText: string) {
    const sentiment = this.nlpService.analyzeSentiment(resumeText);
    
    let feedback = '';
    if (sentiment.assessment === 'positive') {
      feedback = 'Great! Your resume uses confident, positive language.';
    } else if (sentiment.assessment === 'negative') {
      feedback = 'Consider using more positive and action-oriented language.';
    } else {
      feedback = 'Your resume language is neutral. Try adding more action verbs and achievements.';
    }

    return {
      score: sentiment.score,
      assessment: sentiment.assessment,
      feedback
    };
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovements(
    sections: any,
    skills: any,
    experience: any,
    sentiment: any
  ): string[] {
    const improvements: string[] = [];

    // Section improvements
    if (sections.missing.length > 0) {
      improvements.push(
        `Missing critical sections: ${sections.missing.join(', ')}. Add these to make your resume complete.`
      );
    }

    // Skills improvements
    if (skills.found.length < 5) {
      improvements.push(
        'Add more relevant technical skills. Aim for at least 8-10 skills related to your target role.'
      );
    }

    if (skills.suggested.length > 0) {
      improvements.push(
        `Consider learning these in-demand skills: ${skills.suggested.slice(0, 3).join(', ')}`
      );
    }

    // Experience improvements
    if (experience.years === 0) {
      improvements.push(
        'Clearly mention your years of experience in each role or add a professional summary highlighting your experience.'
      );
    }

    // Language improvements
    if (sentiment.assessment !== 'positive') {
      improvements.push(
        'Use strong action verbs (e.g., "developed", "led", "implemented") to describe your achievements.'
      );
    }

    // General tips
    improvements.push('Quantify your achievements with numbers and metrics where possible.');
    improvements.push('Tailor your resume for each job application by matching keywords from the job description.');

    return improvements;
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(
    sections: any,
    skills: any,
    experience: any,
    sentiment: any
  ): number {
    let score = 0;

    // Sections score (40 points max)
    const sectionScore = (sections.found.length / 8) * 40;
    score += sectionScore;

    // Skills score (30 points max)
    const skillScore = Math.min((skills.found.length / 10) * 30, 30);
    score += skillScore;

    // Experience score (15 points max)
    const expScore = experience.years > 0 ? 15 : 0;
    score += expScore;

    // Sentiment score (15 points max)
    const sentScore = sentiment.assessment === 'positive' ? 15 : 
                      sentiment.assessment === 'neutral' ? 10 : 5;
    score += sentScore;

    return Math.round(Math.min(score, 100));
  }
}