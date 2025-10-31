// src/skills/skills.controller.ts
import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  /**
   * Get skill recommendations
   * POST /skills/recommendations
   */
  @Post('recommendations')
  async getRecommendations(
    @Body('skillsText') skillsText: string,
    @Body('targetRole') targetRole?: string
  ) {
    if (!skillsText || skillsText.trim().length < 10) {
      throw new BadRequestException(
        'Please provide your current skills (at least 10 characters)'
      );
    }

    const recommendations = await this.skillsService.getSkillRecommendations(
      skillsText,
      targetRole
    );

    return {
      success: true,
      data: recommendations,
      message: 'Skill recommendations generated successfully'
    };
  }

  /**
   * Get interview preparation
   * POST /skills/interview-prep
   */
  @Post('interview-prep')
  async getInterviewPrep(
    @Body('skillsText') skillsText: string,
    @Body('targetRole') targetRole?: string
  ) {
    if (!skillsText || skillsText.trim().length < 10) {
      throw new BadRequestException(
        'Please provide your skills for interview preparation'
      );
    }

    const preparation = await this.skillsService.getInterviewPreparation(
      skillsText,
      targetRole
    );

    return {
      success: true,
      data: preparation,
      message: 'Interview preparation generated successfully'
    };
  }

  /**
   * Get all available skill categories
   * GET /skills/categories
   */
  @Get('categories')
  getSkillCategories() {
    const { SKILLS_DATABASE } = require('../common/data/skills-database');
    
    const categories = SKILLS_DATABASE.map(db => ({
      category: db.category,
      skillCount: db.skills.length,
      relatedRoles: db.relatedRoles,
      sampleSkills: db.skills.slice(0, 5)
    }));

    return {
      success: true,
      data: categories,
      message: 'Skill categories retrieved successfully'
    };
  }
}