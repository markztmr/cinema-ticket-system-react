export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isAdmin: boolean;
  rowVersion?: string;
}

export interface Cinema {
  id: number;
  name: string;
  rows: number;
  seatsPerRow: number;
}

export interface Screening {
  id: number;
  cinemaId: number;
  cinema?: Cinema;
  title: string;
  startTime: string;
  reservations?: Reservation[];
}

export interface Reservation {
  id: number;
  screeningId: number;
  userId?: number;
  row: number;
  seat: number;
}

export interface Booking {
  id: number;
  screening?: Screening;
  row: number;
  seat: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (id: number, firstName: string, lastName: string, phoneNumber: string, password?: string, rowVersion?: string) => Promise<User | undefined>;
}
