import mongoose, { Model, Document } from 'mongoose';

import { Position } from '@src/services/ForecastService';

export interface Beach {
  _id?: string;
  lat: number;
  lng: number;
  name: string;
  position: Position;
  user: string;
}

export interface IBeachModel extends Omit<Beach, '_id'>, Document {}

const schema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  },
);

export default mongoose.model('Beach', schema) as Model<IBeachModel>;
