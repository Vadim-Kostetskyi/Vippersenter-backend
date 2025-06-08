import mongoose, { Document, Model, Schema } from "mongoose";
import bCrypt from "bcryptjs";

interface IUser extends Document {
  username?: string;
  email: string;
  password: string;
  setPassword(password: string): void;
  validPassword(password: string): boolean;
}

const userSchema: Schema<IUser> = new Schema({
  username: String,
  email: {
    type: String,
    required: [true, "Email required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password required"],
  },
});

userSchema.methods.setPassword = function (password: string): void {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(6));
};

userSchema.methods.validPassword = function (password: string): boolean {
  return bCrypt.compareSync(password, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("user", userSchema);
export default User;
