import mongoose, { Schema, model, models } from "mongoose";

const LanguageTariffSchema = new Schema({
    language: String,
    normal: Number,
    express: Number,
    fast: Number,
});

const SampleSchema = new Schema({
    title: String,
    imageUrl: String,
    languageTariffs: [LanguageTariffSchema],
});

const DocumentSchema = new Schema({
    name: { type: String, required: true },
    order: { type: Number, unique: true, required: true },
    documentCountry: { type: String, enum: ["ua", "kz"], required: true },
    languageTariffs: [LanguageTariffSchema],
    samples: [SampleSchema],
});

export interface LanguageTariffDoc {
    language: string;
    normal: number;
    express: number;
    fast: number;
    _id?: mongoose.Types.ObjectId;
}

export interface SampleDoc {
    title: string;
    imageUrl?: string;
    languageTariffs?: LanguageTariffDoc[];
    _id?: mongoose.Types.ObjectId;
}

export interface DocumentDoc {
    _id: mongoose.Types.ObjectId;
    name: string;
    order: number;
    documentCountry: "ua" | "kz";
    languageTariffs: LanguageTariffDoc[];
    samples: SampleDoc[];
}

const DocumentModel =
    (models.Document as mongoose.Model<DocumentDoc>) ||
    model<DocumentDoc>("Document", DocumentSchema);

export default DocumentModel;
