import { Drone } from './types';

export const DRONES: Drone[] = [
  {
    id: 'm490',
    name: '亞拓 M490',
    model: 'Align M490',
    colorClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-200',
    dotColor: '#eab308',
    description: '可考I、Ia (建議用於定位模式)'
  },
  {
    id: 'hexa',
    name: '六軸自組機',
    model: 'Custom Hexacopter',
    colorClass: 'bg-neutral-100',
    textClass: 'text-neutral-900',
    borderClass: 'border-neutral-300',
    dotColor: '#171717',
    description: '可考I、Ia (建議用於定位模式)'
  },
  {
    id: 'm210',
    name: 'DJI M210',
    model: 'Matrice 210',
    colorClass: 'bg-emerald-100',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    dotColor: '#10b981',
    description: '可考Ia (可用於定位模式、姿態模式)'
  },
  {
    id: 't110',
    name: '樂飛 T110',
    model: 'LeFei T110',
    colorClass: 'bg-rose-100',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    dotColor: '#e11d48',
    description: '可考I、Ia、Ib (可用於定位模式、姿態模式)'
  }
];

export const TIME_SLOTS = [
  "上午 (08:00 - 12:00)",
  "下午 (13:00 - 17:00)",
  "全日 (08:00 - 17:00)"
];

export const BATTERY_CONFIG = {
  SHARED_POOL_IDS: ['m490', 'hexa'],
  TOTAL_BATTERIES: 8
};
