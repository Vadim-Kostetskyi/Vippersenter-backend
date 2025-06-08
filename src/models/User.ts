import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  setPassword(password: string): void;
  validPassword(password: string): boolean;
}

const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
});

UserSchema.methods.setPassword = function (password: string) {
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(password, salt);
};

UserSchema.methods.validPassword = function (password: string): boolean {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
