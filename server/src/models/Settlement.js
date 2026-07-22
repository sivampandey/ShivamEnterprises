import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    labourerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Labourer',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    amountSettled: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: 'Settlement Payment',
    },
  },
  {
    timestamps: true,
  }
);

export const Settlement = mongoose.model('Settlement', settlementSchema);
