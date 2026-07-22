import apiClient from './axios';
import { AttendanceRecord, AttendanceStatus, Labourer } from './types';
import {
  getStoredAttendance,
  saveStoredAttendance,
  getStoredLabourers,
} from './mockBackend';

export interface RegisterItem {
  labourer: Labourer;
  attendanceId?: string;
  status: AttendanceStatus;
  advanceTaken: number;
  earnedAmount: number;
}

export const attendanceApi = {
  getRegisterForDate: async (date: string): Promise<RegisterItem[]> => {
    try {
      const response = await apiClient.get<RegisterItem[]>('/attendance', { params: { date } });
      return response.data;
    } catch (e: any) {
      if (e.response) throw e;
    }

    const activeLabourers = getStoredLabourers().filter((l) => l.isActive);
    const attendanceRecords = getStoredAttendance().filter((a) => a.date === date);

    return activeLabourers.map((labourer) => {
      const existing = attendanceRecords.find((a) => a.labourerId === labourer.id);
      const status: AttendanceStatus = existing ? existing.status : null;
      const advanceTaken = existing ? existing.advanceTaken : 0;

      let earnedAmount = 0;
      if (status === 'PRESENT') earnedAmount = labourer.dailyWage;
      else if (status === 'HALF_DAY') earnedAmount = labourer.dailyWage / 2;

      return {
        labourer,
        attendanceId: existing?.id,
        status,
        advanceTaken,
        earnedAmount,
      };
    });
  },

  updateAttendance: async (
    labourerId: string,
    date: string,
    status: AttendanceStatus,
    advanceTaken: number
  ): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post<AttendanceRecord>('/attendance', {
        labourerId,
        date,
        status,
        advanceTaken,
      });
      return response.data;
    } catch (e: any) {
      if (e.response) throw e;
    }

    const records = getStoredAttendance();
    const labourers = getStoredLabourers();
    const labourer = labourers.find((l) => l.id === labourerId);
    if (!labourer) throw new Error('Labourer not found');

    let earnedAmount = 0;
    if (status === 'PRESENT') earnedAmount = labourer.dailyWage;
    else if (status === 'HALF_DAY') earnedAmount = labourer.dailyWage / 2;

    const idx = records.findIndex((r) => r.labourerId === labourerId && r.date === date);

    let updatedRecord: AttendanceRecord;

    if (idx !== -1) {
      updatedRecord = {
        ...records[idx],
        status,
        advanceTaken: Number(advanceTaken) || 0,
        earnedAmount,
      };
      records[idx] = updatedRecord;
    } else {
      updatedRecord = {
        id: `att-${Date.now()}`,
        labourerId,
        date,
        status,
        advanceTaken: Number(advanceTaken) || 0,
        earnedAmount,
      };
      records.push(updatedRecord);
    }

    saveStoredAttendance(records);
    return updatedRecord;
  },
};
