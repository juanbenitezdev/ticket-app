import mongoose from 'mongoose';

// An interface that describes the properties that are required to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a User model has
interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: UserAttrs): UserDocument;
}

// An interface that describes the properties that a User Document has
interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.statics.build = (atrrs: UserAttrs) => {
  return new User(atrrs);
};

const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export { User };
