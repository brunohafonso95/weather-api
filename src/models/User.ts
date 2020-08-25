import mongoose, { Document, Model } from 'mongoose';

import Logger from '@src/Logger';
import AuthService from '@src/services/AuthService';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

export interface IUserModel extends Omit<User, '_id'>, Document {}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: [true, 'Email must be unique'],
    },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  },
);

userSchema.path('email').validate(
  async (email: string) => {
    const emailCount = await mongoose.models.User.countDocuments({ email });
    return !emailCount;
  },
  'email already exists on database',
  CUSTOM_VALIDATION.DUPLICATED,
);

userSchema.pre<IUserModel>('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return;
  }

  try {
    this.password = await AuthService.hashPassword(this.password);
  } catch (error) {
    Logger.error('error during the process to encrypt the password', error);
  }
});

export default mongoose.model('User', userSchema) as Model<IUserModel>;
