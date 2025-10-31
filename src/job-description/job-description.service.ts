// src/job-description/job-description.service.ts
import { Injectable } from '@nestjs/common';
import { NlpService } from '../common/nlp/nlp.service';
import { SKILLS_DATABASE } from '../common/data/skills-database';

export interface JobAnalysis {
  role: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: {
    minimum: number;
    preferred: number;
    level: string;
  };
  keywords: string[];
  responsibilities: string[];
  qualifications: string[];
  matchScore?: number;
  recommendations?: string[];
}

@Injectable()
export class JobDescriptionService {
  constructor(private readonly nlpService: NlpService) {}

  /**
   * Analyze job description and extract key information
   */
  async analyzeJobDescription(jobText: string): Promise<JobAnalysis> {
    const role = this.extractRole(jobText);
    const skills = this.extractSkills(jobText);
    const experienceLevel = this.extractExperienceLevel(jobText);
    const keywords = this.nlpService.extractKeywords(jobText, 20);
    const responsibilities = this.extractResponsibilities(jobText);
    const qualifications = this.extractQualifications(jobText);

    return {
      role,
      requiredSkills: skills.required,
      preferredSkills: skills.preferred,
      experienceLevel,
      keywords,
      responsibilities,
      qualifications
    };
  }

  /**
   * Compare resume with job description
   */
  async compareResumeWithJob(
    resumeText: string,
    jobText: string
  ): Promise<JobAnalysis> {
    const jobAnalysis = await this.analyzeJobDescription(jobText);
    const resumeSkills = this.nlpService.extractSkills(resumeText);
    
    // Calculate match score
    const matchScore = this.calculateMatchScore(
      resumeSkills,
      jobAnalysis.requiredSkills,
      jobAnalysis.preferredSkills
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      resumeSkills,
      jobAnalysis.requiredSkills,
      jobAnalysis.preferredSkills
    );

    return {
      ...jobAnalysis,
      matchScore,
      recommendations
    };
  }

  /**
   * Extract job role/title
   */
  private extractRole(jobText: string): string {
    const lines = jobText.split('\n').filter(line => line.trim().length > 0);
    
    // Usually the role is in the first few lines
    const rolePatterns = [
      /(?:position|role|title|job)\s*:?\s*(.+)/i,
      /hiring\s+(?:a|an)?\s*(.+?)(?:\s+to|\s+for|$)/i
    ];

    for (const line of lines.slice(0, 5)) {
      for (const pattern of rolePatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[1].trim();
        }
      }
      // If line looks like a title (short, capitalized)
      if (line.length < 50 && /^[A-Z]/.test(line)) {
        return line.trim();
      }
    }

    return 'Not specified';
  }

  /**
   * Extract required and preferred skills
   */
  private extractSkills(jobText: string): {
    required: string[];
    preferred: string[];
  } {
    const allSkills = this.nlpService.extractSkills(jobText);
    const lowerText = jobText.toLowerCase();

    const required: string[] = [];
    const preferred: string[] = [];

    // Check context around each skill
    allSkills.forEach(skill => {
      const skillIndex = lowerText.indexOf(skill.toLowerCase());
      if (skillIndex === -1) return;

      // Get surrounding text (100 chars before and after)
      const start = Math.max(0, skillIndex - 100);
      const end = Math.min(lowerText.length, skillIndex + 100);
      const context = lowerText.substring(start, end);

      // Check if it's required or preferred
      if (
        context.includes('required') ||
        context.includes('must have') ||
        context.includes('essential')
      ) {
        required.push(skill);
      } else if (
        context.includes('preferred') ||
        context.includes('nice to have') ||
        context.includes('bonus')
      ) {
        preferred.push(skill);
      } else {
        // Default to required if no context
        required.push(skill);
      }
    });

    return {
      required: [...new Set(required)],
      preferred: [...new Set(preferred)]
    };
  }

  /**
   * Extract experience requirements
   */
  private extractExperienceLevel(jobText: string): {
    minimum: number;
    preferred: number;
    level: string;
  } {
    const minYears = this.nlpService.extractExperience(jobText);
    
    // Look for preferred/ideal experience
    const preferredMatch = jobText.match(/(\d+)\+?\s*years?.+?(?:preferred|ideal)/i);
    const preferred = preferredMatch ? parseInt(preferredMatch[1]) : minYears;

    let level = 'Entry Level';
    if (minYears >= 8) level = 'Senior/Lead';
    else if (minYears >= 5) level = 'Senior';
    else if (minYears >= 3) level = 'Mid-Level';
    else if (minYears >= 1) level = 'Junior';

    return {
      minimum: minYears,
      preferred,
      level
    };
  }

  /**
   * Extract job responsibilities
   */
  private extractResponsibilities(jobText: string): string[] {
    const responsibilities: string[] = [];
    const lines = jobText.split('\n');
    
    let inResponsibilitiesSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check if we're entering responsibilities section
      if (/responsibilities|duties|what you'll do/i.test(trimmed)) {
        inResponsibilitiesSection = true;
        continue;
      }
      
      // Check if we're leaving the section
      if (inResponsibilitiesSection && /qualifications|requirements|skills/i.test(trimmed)) {
        break;
      }
      
      // Extract bullet points or numbered items
      if (inResponsibilitiesSection) {
        const cleaned = trimmed.replace(/^[-•*\d.)\]]+\s*/, '');
        if (cleaned.length > 20 && cleaned.length < 200) {
          responsibilities.push(cleaned);
        }
      }
    }

    return responsibilities.slice(0, 8); // Limit to top 8
  }

  /**
   * Extract qualifications
   */
  private extractQualifications(jobText: string): string[] {
    const qualifications: string[] = [];
    const lines = jobText.split('\n');
    
    let inQualificationsSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (/qualifications|requirements|what we're looking for/i.test(trimmed)) {
        inQualificationsSection = true;
        continue;
      }
      
      if (inQualificationsSection && /responsibilities|about us|company/i.test(trimmed)) {
        break;
      }
      
      if (inQualificationsSection) {
        const cleaned = trimmed.replace(/^[-•*\d.)\]]+\s*/, '');
        if (cleaned.length > 20 && cleaned.length < 200) {
          qualifications.push(cleaned);
        }
      }
    }

    return qualifications.slice(0, 8);
  }

  /**
   * Calculate match score between resume and job
   */
  private calculateMatchScore(
    resumeSkills: string[],
    requiredSkills: string[],
    preferredSkills: string[]
  ): number {
    let score = 0;
    const totalRequired = requiredSkills.length;
    const totalPreferred = preferredSkills.length;

    if (totalRequired === 0) return 50; // Default if no skills detected

    // Required skills worth 70 points
    const matchedRequired = requiredSkills.filter(reqSkill =>
      resumeSkills.some(resSkill =>
        resSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(resSkill.toLowerCase())
      )
    ).length;

    score += (matchedRequired / totalRequired) * 70;

    // Preferred skills worth 30 points
    if (totalPreferred > 0) {
      const matchedPreferred = preferredSkills.filter(prefSkill =>
        resumeSkills.some(resSkill =>
          resSkill.toLowerCase().includes(prefSkill.toLowerCase()) ||
          prefSkill.toLowerCase().includes(resSkill.toLowerCase())
        )
      ).length;

      score += (matchedPreferred / totalPreferred) * 30;
    } else {
      score += 30; // Full points if no preferred skills listed
    }

    return Math.round(score);
  }

  /**
   * Generate recommendations for improving match
   */
  private generateRecommendations(
    resumeSkills: string[],
    requiredSkills: string[],
    preferredSkills: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Find missing required skills
    const missingRequired = requiredSkills.filter(reqSkill =>
      !resumeSkills.some(resSkill =>
        resSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(resSkill.toLowerCase())
      )
    );

    if (missingRequired.length > 0) {
      recommendations.push(
        `Critical: Add these required skills to your resume: ${missingRequired.slice(0, 5).join(', ')}`
      );
      recommendations.push(
        'Consider taking online courses or building projects to gain these skills.'
      );
    }

    // Find missing preferred skills
    const missingPreferred = preferredSkills.filter(prefSkill =>
      !resumeSkills.some(resSkill =>
        resSkill.toLowerCase().includes(prefSkill.toLowerCase()) ||
        prefSkill.toLowerCase().includes(resSkill.toLowerCase())
      )
    );

    if (missingPreferred.length > 0) {
      recommendations.push(
        `Enhance your profile with these preferred skills: ${missingPreferred.slice(0, 3).join(', ')}`
      );
    }

    // General recommendations
    recommendations.push(
      'Tailor your resume to include keywords from this job description.'
    );
    recommendations.push(
      'Highlight projects or experiences that demonstrate the required skills.'
    );

    return recommendations;
  }
}