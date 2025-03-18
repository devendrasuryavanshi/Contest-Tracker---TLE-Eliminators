import mongoose, { Document, Schema } from 'mongoose';

export interface IContest extends Document {
    contestName: string;
    contestId: string;
    contestUrl: string;
    platform: string;
    contestStartDate: Date;
    contestEndDate: Date;
    contestDuration: number;
    bookmarks: mongoose.Types.ObjectId[];
    solutionUrl?: string;
    isBookmarked?: boolean;
}

const ContestSchema: Schema = new Schema({
    contestName: { type: String, required: true },
    contestId: { type: String, required: true },
    contestUrl: { type: String, required: true },
    platform: { type: String, required: true },
    contestStartDate: { type: Date, required: true },
    contestEndDate: { type: Date, required: true },
    contestDuration: { type: Number, required: true },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    solutionUrl: { type: String }
}, {
    timestamps: true
});

ContestSchema.index({ contestStartDate: 1, contestEndDate: 1 });
ContestSchema.index({ platform: 1 });
ContestSchema.index({ contestName: 'text' });

export default mongoose.model<IContest>('Contest', ContestSchema);
