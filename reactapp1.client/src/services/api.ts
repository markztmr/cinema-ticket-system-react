import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { User, Screening, Cinema, Booking } from '../types/index';

const API_BASE_URL = 'http://localhost:5145/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });
  }

  async register(firstName: string, lastName: string, phoneNumber: string, password: string): Promise<User> {
    const response = await this.api.post<User>('/auth/register', {
      firstName,
      lastName,
      phoneNumber,
      password,
    });
    return response.data;
  }

  async login(phoneNumber: string, password: string): Promise<User> {
    const response = await this.api.post<User>('/auth/login', {
      phoneNumber,
      password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/auth/me');
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response = await this.api.get<User>(`/auth/${id}`);
    return response.data;
  }

  async updateUser(id: number, firstName: string, lastName: string, phoneNumber: string, password?: string, rowVersion?: string): Promise<User> {
    const response = await this.api.put<User>(`/auth/${id}`, {
      firstName,
      lastName,
      phoneNumber,
      password: password || null,
      rowVersion: rowVersion || null,
    });
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/auth/${id}`);
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.api.get<User[]>('/auth');
    return response.data;
  }

  async getCinemas(): Promise<Cinema[]> {
    const response = await this.api.get<Cinema[]>('/cinemas');
    return response.data;
  }

  async getCinema(id: number): Promise<Cinema> {
    const response = await this.api.get<Cinema>(`/cinemas/${id}`);
    return response.data;
  }

  async getScreenings(): Promise<Screening[]> {
    const response = await this.api.get<Screening[]>('/screenings');
    return response.data;
  }

  async getScreening(id: number): Promise<Screening> {
    const response = await this.api.get<Screening>(`/screenings/${id}`);
    return response.data;
  }

  async createScreening(cinemaId: number, title: string, startTime: string): Promise<Screening> {
    const response = await this.api.post<Screening>('/screenings', {
      cinemaId,
      title,
      startTime,
    });
    return response.data;
  }

  async deleteScreening(id: number): Promise<void> {
    await this.api.delete(`/screenings/${id}`);
  }

  async toggleReservation(screeningId: number, row: number, seat: number): Promise<void> {
    await this.api.post('/reservations/toggle', {
      screeningId,
      row,
      seat,
    }, {
      params: { screeningId, row, seat }
    });
  }

  async getMyBookings(): Promise<Booking[]> {
    const response = await this.api.get<Booking[]>('/reservations/my-bookings');
    return response.data;
  }

  async cancelReservation(id: number): Promise<void> {
    await this.api.delete(`/reservations/${id}`);
  }
}

export default new ApiService();
