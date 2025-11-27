// src/auth/verification.service.ts - ՈՒՂՂՎԱԾ
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { VerificationCode } from './schemas/verification-code.schema'; // ✅ ԱՎԵԼԱՑՆԵԼ

@Injectable()
export class VerificationService {
  private transporter;

  constructor(
    @InjectModel(VerificationCode.name) 
    private verificationModel: Model<VerificationCode>, // ✅ ՃՇՏ ՏԵՍԱԿԸ
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // TEMPORARY: Always show code prominently
  async sendVerificationCode(email: string): Promise<string> {
    const code = this.generateVerificationCode();
    
    // Production-ում միշտ ուղարկել email
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // ✅ LIVE-ում ուղարկում է user-ի իրական email-ին
      subject: 'Your Verification Code',
      html: `<h1>Your code: ${code}</h1>`
    });
  
    // Save to database
    await this.verificationModel.deleteOne({ email });
    await this.verificationModel.create({ email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  
    return code;
  }
  async verifyCode(email: string, inputCode: string): Promise<boolean> {
    try {
      const verification = await this.verificationModel.findOne({ email });
      
      if (!verification) {
        console.log('❌ No verification code found');
        return false;
      }

      if (verification.code !== inputCode) {
        console.log('❌ Invalid code');
        return false;
      }

      // Delete used code
      await this.verificationModel.deleteOne({ email });
      console.log('✅ Code verified successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Verification error:', error);
      return false;
    }
  }
}