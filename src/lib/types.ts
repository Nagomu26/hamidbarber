export type ServiceId = "corte" | "fade" | "barba" | "completo";

export interface Service {
  id: ServiceId;
  nombre: string;
  precio: number;
  descripcion: string;
  destacado?: boolean;
}

export type OcupadasPorDia = Record<string, string[]>;

export interface BookingPayload {
  nombre: string;
  telefono: string;
  servicio: string;
  precio: number | null;
  fecha: string;
  hora: string;
  origen: string;
  fechaEnvio: string;
  token?: string;
}

export interface BookingState {
  fecha: Date | null;
  hora: string | null;
  servicioId: ServiceId | null;
}