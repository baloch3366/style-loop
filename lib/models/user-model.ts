// lib/models/user-model.ts - COMPLETE VERSION WITH RESET TOKENS
import { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
    // ✅ NEW: Password reset fields
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual id field
userSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Transform for JSON output
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.passwordChangedAt;
    delete ret.failedLoginAttempts;
    delete ret.accountLockedUntil;
    // ✅ Exclude reset token fields from output
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    
    if (ret.image === '') ret.image = null;
    
    return ret;
  }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
    }
    
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const UserModel = this.constructor as any;
    const user = await UserModel.findById(this._id).select('+password');
    
    if (!user || !user.password) {
      return false;
    }
    
    return bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

// Check if password changed after JWT timestamp
userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Increment failed login attempts
userSchema.methods.incrementFailedLoginAttempts = async function(): Promise<void> {
  this.failedLoginAttempts += 1;
  
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  await this.save();
};

// Reset failed login attempts
userSchema.methods.resetFailedLoginAttempts = async function(): Promise<void> {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  await this.save();
};

// Indexes (optional: add index on reset token for faster lookups)
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });
userSchema.index({ resetPasswordExpires: 1 });

// TypeScript interface
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  image?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
  passwordChangedAt?: Date | null;
  failedLoginAttempts?: number;
  accountLockedUntil?: Date | null;
  // ✅ New fields
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  incrementFailedLoginAttempts(): Promise<void>;
  resetFailedLoginAttempts(): Promise<void>;
}

const User = models.User || model<IUser>("User", userSchema);
export default User;