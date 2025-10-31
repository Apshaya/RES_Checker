// src/common/nlp/nlp.service.ts
import { Injectable } from '@nestjs/common';
import * as natural from 'natural';
import nlp from 'compromise';

@Injectable()
export class NlpService {
  private tokenizer: natural.WordTokenizer;
  private tfidf: natural.TfIdf;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  /**
   * Extract keywords from text using TF-IDF algorithm
   * TF-IDF = Term Frequency - Inverse Document Frequency
   * Helps identify important words in a document
   */
  extractKeywords(text: string, topN: number = 10): string[] {
    this.tfidf.addDocument(text.toLowerCase());
    
    const keywords: { term: string; score: number }[] = [];
    
    this.tfidf.listTerms(0).forEach((item) => {
      if (item.term.length > 3) { // Filter short words
        keywords.push({ term: item.term, score: item.tfidf });
      }
    });

    // Sort by score and return top N
    return keywords
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map(k => k.term);
  }

  /**
   * Extract skills from text using pattern matching
   * Looks for common skill patterns in resumes/job descriptions
   */
  extractSkills(text: string): string[] {
    const doc = nlp(text);
    const skills: Set<string> = new Set();

    // Common skill patterns
    const techSkills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue',
      'nodejs', 'nestjs', 'express', 'mongodb', 'sql', 'postgresql',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git',
      'typescript', 'html', 'css', 'rest', 'graphql', 'api'
    ];

    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving',
      'analytical', 'creative', 'management', 'collaboration'
    ];

    const allSkills = [...techSkills, ...softSkills];

    // Check if skills are mentioned in text
    const lowerText = text.toLowerCase();
    allSkills.forEach(skill => {
      if (lowerText.includes(skill)) {
        skills.add(skill);
      }
    });

    // Extract capitalized phrases (often skills/certifications)
    const capitalizedPhrases = doc.match('#Acronym').out('array');
    capitalizedPhrases.forEach(phrase => {
      if (phrase.length > 2) {
        skills.add(phrase);
      }
    });

    return Array.from(skills);
  }

  /**
   * Analyze text sentiment and return score
   * Useful for analyzing resume language positivity
   */
  analyzeSentiment(text: string): { score: number; assessment: string } {
    const analyzer = new natural.SentimentAnalyzer(
      'English',
      natural.PorterStemmer,
      'afinn'
    );

    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const score = analyzer.getSentiment(tokens);

    let assessment = 'neutral';
    if (score > 0.3) assessment = 'positive';
    else if (score < -0.3) assessment = 'negative';

    return { score, assessment };
  }

  /**
   * Extract sections from resume text
   * Identifies common resume sections
   */
  extractSections(text: string): Record<string, boolean> {
    const lowerText = text.toLowerCase();
    
    return {
      summary: /summary|objective|profile/i.test(text),
      experience: /experience|employment|work history/i.test(text),
      education: /education|academic|degree|university/i.test(text),
      skills: /skills|technical|competencies/i.test(text),
      projects: /projects|portfolio/i.test(text),
      certifications: /certification|certificate|licensed/i.test(text),
      achievements: /achievement|award|honor/i.test(text),
      contact: /email|phone|linkedin|github/i.test(text)
    };
  }

  /**
   * Calculate text similarity using Jaro-Winkler distance
   * Useful for matching resume skills with job requirements
   */
  calculateSimilarity(text1: string, text2: string): number {
    return natural.JaroWinklerDistance(
      text1.toLowerCase(),
      text2.toLowerCase()
    );
  }

  /**
   * Extract years of experience from text
   */
  extractExperience(text: string): number {
    const patterns = [
      /(\d+)\+?\s*years?/i,
      /(\d+)\+?\s*yrs?/i,
      /(\d+)\s*-\s*(\d+)\s*years?/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return 0;
  }
}