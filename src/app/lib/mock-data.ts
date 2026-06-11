
export interface Hospital {
  id: string;
  name: string;
  address: string;
  capacity: number;
  occupancyCurrent: number;
  specialties: string[];
  coordinates: { latitude: number; longitude: number };
}

export interface Ambulance {
  id: string;
  code: string;
  status: 'available' | 'en route' | 'occupied' | 'out of service';
  driver: string;
  currentLocation: string;
  coordinates: { latitude: number; longitude: number };
}

export interface Emergency {
  id: string;
  patientName: string;
  patientCondition: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'dispatched' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
  location: string;
  ambulanceId?: string;
  hospitalId?: string;
  createdAt: string;
}

export const mockHospitals: Hospital[] = [
  {
    id: 'h1',
    name: 'General Medical Center',
    address: '123 Health Ave, Central District',
    capacity: 200,
    occupancyCurrent: 145,
    specialties: ['Trauma', 'Cardiology', 'Neurology'],
    coordinates: { latitude: -12.0464, longitude: -77.0428 },
  },
  {
    id: 'h2',
    name: 'Mercy Children Hospital',
    address: '456 Care St, North District',
    capacity: 100,
    occupancyCurrent: 82,
    specialties: ['Pediatrics', 'Neonatology'],
    coordinates: { latitude: -12.0673, longitude: -77.0337 },
  },
  {
    id: 'h3',
    name: 'University Hospital',
    address: '789 Science Rd, West District',
    capacity: 350,
    occupancyCurrent: 120,
    specialties: ['Oncology', 'Emergency Surgery', 'Rehabilitation'],
    coordinates: { latitude: -12.0847, longitude: -77.0612 },
  },
];

export const mockAmbulances: Ambulance[] = [
  {
    id: 'a1',
    code: 'UNIT-101',
    status: 'available',
    driver: 'John Smith',
    currentLocation: 'Main Station Alpha',
    coordinates: { latitude: -12.0500, longitude: -77.0400 },
  },
  {
    id: 'a2',
    code: 'UNIT-202',
    status: 'en route',
    driver: 'Sarah Connor',
    currentLocation: 'Transit - Sector 4',
    coordinates: { latitude: -12.0600, longitude: -77.0500 },
  },
  {
    id: 'a3',
    code: 'UNIT-303',
    status: 'occupied',
    driver: 'Mike Tyson',
    currentLocation: 'General Medical Center',
    coordinates: { latitude: -12.0464, longitude: -77.0428 },
  },
  {
    id: 'a4',
    code: 'UNIT-404',
    status: 'available',
    driver: 'Ellen Ripley',
    currentLocation: 'Station Beta',
    coordinates: { latitude: -12.0700, longitude: -77.0200 },
  },
];

export const mockEmergencies: Emergency[] = [
  {
    id: 'E-001',
    patientName: 'Robert Langdon',
    patientCondition: 'Suspected Cardiac Arrest',
    priority: 'critical',
    status: 'dispatched',
    location: '12 Oak St, Downtown',
    ambulanceId: 'a2',
    hospitalId: 'h1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'E-002',
    patientName: 'Alice Johnson',
    patientCondition: 'Severe Allergic Reaction',
    priority: 'high',
    status: 'pending',
    location: 'Parkside Ave 233',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'E-003',
    patientName: 'Sam Gamgee',
    patientCondition: 'Minor Lacery',
    priority: 'low',
    status: 'completed',
    location: 'Hobbiton Gdns 1',
    ambulanceId: 'a3',
    hospitalId: 'h3',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];
