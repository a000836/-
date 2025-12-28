export type DroneId = 'm490' | 'hexa' | 'm210' | 't110';

export interface Drone {
  id: DroneId;
  name: string;
  model: string;
  colorClass: string; // Tailwind bg color for badge/calendar
  textClass: string;  // Tailwind text color
  borderClass: string; // Tailwind border color
  dotColor: string;    // Hex color for dots
  description: string;
}

export interface Booking {
  id: string;
  unit: string;      // 單位
  applicant: string; // 姓名
  phone: string;     // 聯絡電話
  date: string;      // 借用日期 YYYY-MM-DD
  timeSlot: string;  // 借用時段
  droneId: DroneId;  // 借用項目
  batteryCount?: number; // 借用電池數
  createdAt: number;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string; // YYYY-MM-DD
}
