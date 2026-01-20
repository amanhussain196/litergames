import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    avatar: string;
    isGuest: boolean;
    friends: string[]; // List of User IDs
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    avatar: { type: String, required: true },
    isGuest: { type: Boolean, default: true },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
