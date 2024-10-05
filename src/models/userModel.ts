import bcrypt from 'bcrypt';
import mongoose, { ObjectId } from 'mongoose';

export interface IUser extends Document {
  _id: ObjectId;
  username: string;
  password: string;
  save(): Promise<IUser>; // Add the save method
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'Minimum password length is 8 characters'],
  },
});

userSchema.pre('save', async function (next) {
  // hash password
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
