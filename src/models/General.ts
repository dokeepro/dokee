import mongoose, { Schema, model, models } from "mongoose";

const GeneralSchema = new Schema({
    sitePaused: { type: Boolean, default: false },
    kzNormalSlots: { type: Number, default: 0 },
    kzExpressSlots: { type: Number, default: 0 },
    kzFastSlots: { type: Number, default: 0 },
    uaNormalSlots: { type: Number, default: 0 },
    uaExpressSlots: { type: Number, default: 0 },
    uaFastSlots: { type: Number, default: 0 },
});

export interface GeneralDoc {
    _id: mongoose.Types.ObjectId;
    sitePaused: boolean;
    kzNormalSlots: number;
    kzExpressSlots: number;
    kzFastSlots: number;
    uaNormalSlots: number;
    uaExpressSlots: number;
    uaFastSlots: number;
}

const GeneralModel =
    (models.General as mongoose.Model<GeneralDoc>) ||
    model<GeneralDoc>("General", GeneralSchema);

export default GeneralModel;
