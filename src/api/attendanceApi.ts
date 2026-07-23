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

// Helper: convert backend lowercase status → frontend uppercase
const toFrontendStatus = (raw: string | null | undefined): AttendanceStatus => {
  if (raw === 'present') return 'PRESENT';
  if (raw === 'half') return 'HALF_DAY';
  if (raw === 'absent') return 'ABSENT';
  return null;
};

// Helper: convert frontend uppercase status → backend lowercase
const toBackendStatus = (status: AttendanceStatus): string | null => {
  if (status === 'PRESENT') return 'present';
  if (status === 'HALF_DAY') return 'half';
  if (status === 'ABSENT') return 'absent';
  return null;
};

export const attendanceApi = {
  getRegisterForDate: async (date: string): Promise<RegisterItem[]> => {
    try {
      const response = await apiClient.get<any[]>('/attendance', { params: { date } });
      // Map backend response (lowercase status, 'withdrawal' field) to frontend format
      return response.data.map((item: any) => ({
        labourer: {
          id: String(item.labourer?.id || item.labourer?._id || ''),
          name: item.labourer?.name || '',
          dailyWage: item.labourer?.dailyWage ?? 0,
          isActive: item.labourer?.isActive ?? item.labourer?.active ?? true,
          createdAt: item.labourer?.createdAt || '',
          balanceOwed: item.labourer?.balanceOwed,
        },
        attendanceId: item.attendanceId,
        status: toFrontendStatus(item.status),
        advanceTaken: item.withdrawal ?? item.advanceTaken ?? 0,
        earnedAmount: item.earnedAmount ?? 0,
      }));
    } catch (e: any) {
      if (e.response && e.response.status !== 404) throw e;
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
      // Use PUT /:labourerId/:date — backend reads labourerId & date from URL params
      const response = await apiClient.put<any>(`/attendance/${labourerId}/${date}`, {
        status: toBackendStatus(status),       // 'present' | 'half' | 'absent' | null
        withdrawal: Number(advanceTaken) || 0, // backend field name is 'withdrawal'
      });

      const data = response.data;
      return {
        id: String(data._id || data.id || ''),
        labourerId: data.labourerId,
        date: data.date,
        status: toFrontendStatus(data.status),
        advanceTaken: data.withdrawal ?? data.advanceTaken ?? 0,
        earnedAmount: data.earnedAmount ?? 0,
      };
    } catch (e: any) {
      if (e.response && e.response.status !== 404) throw e;
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
