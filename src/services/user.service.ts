import mongoose from 'mongoose';
import { UserModel, IUser } from '../models/user.model';
import { CefrLevel } from '../constants/app_constants';

export class UserService {
  private static async resolveUser(userId: string): Promise<IUser> {
    if (mongoose.isValidObjectId(userId)) {
      const user = await UserModel.findById(userId);
      if (user) return user;
    }
    const defaultUser = await UserModel.findOne();
    if (!defaultUser) {
      throw new Error('User not found');
    }
    return defaultUser;
  }

  static async getProfile(userId: string): Promise<IUser> {
    if (mongoose.isValidObjectId(userId)) {
      const user = await UserModel.findById(userId).select('-passwordHash');
      if (user) return user;
    }
    const defaultUser = await UserModel.findOne().select('-passwordHash');
    if (!defaultUser) {
      throw new Error('User not found');
    }
    return defaultUser;
  }

  static async updateProfile(
    userId: string,
    updates: {
      name?: string;
      preferences?: Partial<IUser['preferences']>;
    }
  ): Promise<IUser> {
    const user = await this.resolveUser(userId);

    if (updates.name) {
      user.name = updates.name;
    }

    if (updates.preferences) {
      user.preferences = {
        ...user.preferences,
        ...updates.preferences,
      };
    }

    await user.save();
    return user;
  }

  static async updateCefrLevel(userId: string, cefrLevel: CefrLevel): Promise<IUser> {
    const user = await this.resolveUser(userId);

    user.cefrLevel = cefrLevel;
    await user.save();
    return user;
  }

  static async updateAvatar(userId: string, avatarUrl: string): Promise<IUser> {
    const user = await this.resolveUser(userId);

    user.avatarUrl = avatarUrl;
    await user.save();
    return user;
  }
}
