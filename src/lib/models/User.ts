import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser } from '../types';

export interface UserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  image: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'CREADOR'],
    default: 'USER'
  }
}, {
  timestamps: true, // Agrega automáticamente createdAt y updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización
UserSchema.index({ role: 1 });

// Evitar la re-compilación del modelo en desarrollo
const User = mongoose.models.User as mongoose.Model<UserDocument> || mongoose.model<UserDocument>('User', UserSchema);

export default User;
