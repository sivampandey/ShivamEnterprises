import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['present', 'half', 'absent', null],
      default: null,
    },
    withdrawal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on labourerId and date to ensure single attendance record per worker per date
attendanceRecordSchema.index({ labourerId: 1, date: 1 }, { unique: true });

export const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
