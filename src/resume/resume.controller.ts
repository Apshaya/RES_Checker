// src/resume/resume.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import * as mammoth from 'mammoth';
const PDFParser = require('pdf2json');

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  /**
   * Analyze resume from plain text
   * POST /resume/analyze
   */
  @Post('analyze')
  async analyzeResumeText(@Body('resumeText') resumeText: string) {
    if (!resumeText || resumeText.trim().length < 50) {
      throw new BadRequestException(
        'Resume text is too short. Please provide at least 50 characters.'
      );
    }

    const analysis = await this.resumeService.analyzeResume(resumeText);
    
    return {
      success: true,
      data: analysis,
      message: 'Resume analyzed successfully'
    };
  }

  /**
   * Analyze resume from uploaded file (PDF, DOCX, TXT)
   * POST /resume/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Only PDF, DOCX, DOC, and TXT files are allowed'), false);
      }
    }
  }))
  async uploadResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Please upload a file');
    }

    let resumeText: string;

    try {
      // Extract text based on file type
      if (file.mimetype === 'application/pdf') {
        resumeText = await this.extractTextFromPdf(file.buffer);
      } else if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword'
      ) {
        resumeText = await this.extractTextFromDocx(file.buffer);
      } else if (file.mimetype === 'text/plain') {
        resumeText = file.buffer.toString('utf-8');
      } else {
        throw new BadRequestException('Unsupported file type');
      }

      if (!resumeText || resumeText.trim().length < 50) {
        throw new BadRequestException(
          'Could not extract enough text from the file. Please ensure the file is not empty or image-based.'
        );
      }

      const analysis = await this.resumeService.analyzeResume(resumeText);
      
      return {
        success: true,
        data: {
          ...analysis,
          fileName: file.originalname,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          extractedTextPreview: resumeText.substring(0, 300) + '...'
        },
        message: 'Resume file analyzed successfully'
      };
    } catch (error) {
      throw new BadRequestException(
        `Error processing file: ${error.message}`
      );
    }
  }

  /**
   * Extract text from PDF
   */
  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new BadRequestException('Failed to parse PDF file. Make sure it\'s not password-protected or corrupted.'));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from PDF
          let text = '';
          if (pdfData.Pages) {
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts) {
                page.Texts.forEach((textItem: any) => {
                  if (textItem.R) {
                    textItem.R.forEach((item: any) => {
                      if (item.T) {
                        text += decodeURIComponent(item.T) + ' ';
                      }
                    });
                  }
                });
              }
              text += '\n';
            });
          }
          resolve(text.trim());
        } catch (error) {
          reject(new BadRequestException('Error extracting text from PDF'));
        }
      });
      
      pdfParser.parseBuffer(buffer);
    });
  }

  /**
   * Extract text from DOCX/DOC
   */
  private async extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new BadRequestException('Failed to parse DOCX file. Make sure it\'s a valid Word document.');
    }
  }

  /**
   * Get sample resume for testing
   * POST /resume/sample
   */
  @Post('sample')
  getSampleResume() {
    const sampleResume = `
John Doe
Email: john.doe@email.com | Phone: +94 77 123 4567
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 3 years of expertise in building scalable web applications 
using React, Node.js, and MongoDB. Passionate about clean code and agile methodologies.

WORK EXPERIENCE
Full Stack Developer | ABC Tech Solutions | Jan 2022 - Present
- Developed and maintained 5+ web applications serving 10,000+ users
- Implemented RESTful APIs using Node.js and Express
- Improved application performance by 40% through optimization
- Led a team of 3 junior developers

Junior Developer | XYZ Company | Jun 2020 - Dec 2021
- Built responsive user interfaces using React and TypeScript
- Collaborated with designers to implement pixel-perfect designs
- Wrote unit tests achieving 85% code coverage

EDUCATION
Bachelor of Science in Computer Science
University of Colombo | 2016 - 2020
GPA: 3.7/4.0

TECHNICAL SKILLS
Frontend: React, JavaScript, TypeScript, HTML, CSS, Redux
Backend: Node.js, Express, NestJS
Databases: MongoDB, PostgreSQL
Tools: Git, Docker, VS Code, Postman

PROJECTS
E-Commerce Platform
- Built a full-stack e-commerce solution with payment integration
- Technologies: React, Node.js, MongoDB, Stripe API

CERTIFICATIONS
AWS Certified Developer Associate | 2023
`;

    return {
      success: true,
      data: { resumeText: sampleResume },
      message: 'Sample resume retrieved'
    };
  }
}