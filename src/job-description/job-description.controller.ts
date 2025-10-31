// src/job-description/job-description.controller.ts
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { JobDescriptionService } from './job-description.service';

@Controller('job-description')
export class JobDescriptionController {
  constructor(
    private readonly jobDescriptionService: JobDescriptionService
  ) {}

  /**
   * Analyze job description
   * POST /job-description/analyze
   */
  @Post('analyze')
  async analyzeJob(@Body('jobText') jobText: string) {
    if (!jobText || jobText.trim().length < 50) {
      throw new BadRequestException(
        'Job description is too short. Please provide at least 50 characters.'
      );
    }

    const analysis = await this.jobDescriptionService.analyzeJobDescription(
      jobText
    );

    return {
      success: true,
      data: analysis,
      message: 'Job description analyzed successfully'
    };
  }

  /**
   * Compare resume with job description
   * POST /job-description/compare
   */
  @Post('compare')
  async compareResumeWithJob(
    @Body('resumeText') resumeText: string,
    @Body('jobText') jobText: string
  ) {
    if (!resumeText || resumeText.trim().length < 50) {
      throw new BadRequestException('Resume text is too short');
    }

    if (!jobText || jobText.trim().length < 50) {
      throw new BadRequestException('Job description is too short');
    }

    const comparison = await this.jobDescriptionService.compareResumeWithJob(
      resumeText,
      jobText
    );

    return {
      success: true,
      data: comparison,
      message: 'Resume and job description compared successfully'
    };
  }

  /**
   * Get sample job description
   * POST /job-description/sample
   */
  @Post('sample')
  getSampleJobDescription() {
    const sampleJob = `
Senior Full Stack Developer

ABC Tech Company is seeking an experienced Full Stack Developer to join our growing team.

Responsibilities:
- Design and develop scalable web applications using modern frameworks
- Collaborate with cross-functional teams to define and ship new features
- Write clean, maintainable code following best practices
- Mentor junior developers and conduct code reviews
- Optimize applications for maximum speed and scalability
- Participate in agile development processes

Required Qualifications:
- 5+ years of professional software development experience
- Strong proficiency in JavaScript/TypeScript and Node.js
- Experience with React or Angular for frontend development
- Solid understanding of RESTful APIs and microservices architecture
- Experience with SQL and NoSQL databases (PostgreSQL, MongoDB)
- Proficiency with Git version control
- Bachelor's degree in Computer Science or related field

Preferred Qualifications:
- Experience with NestJS framework
- Knowledge of Docker and Kubernetes
- Familiarity with AWS or Azure cloud platforms
- Experience with CI/CD pipelines
- Understanding of GraphQL
- Open source contributions

What We Offer:
- Competitive salary and benefits
- Remote work flexibility
- Professional development opportunities
- Collaborative team environment
`;

    return {
      success: true,
      data: { jobText: sampleJob },
      message: 'Sample job description retrieved'
    };
  }
}