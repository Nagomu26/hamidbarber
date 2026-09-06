import type { Service } from "../lib/types";

export const SERVICIOS: Service[] = [
  {
    id: "corte",
    nombre: "Corte Clásico",
    precio: 10,
    descripcion: "Tijera y máquina a medida. El corte de toda la vida, adaptado a tu forma de cara.",
  },
  {
    id: "fade",
    nombre: "Degradado (Fade)",
    precio: 18,
    descripcion: "Transición perfecta de piel a cabello. Precisión al milímetro con acabado limpio.",
  },
  {
    id: "barba",
    nombre: "Arreglo de Barba",
    precio: 10,
    descripcion: "Perfilado con navaja, toalla caliente y aceite. Barba cuidada, línea definida.",
  },
  {
    id: "completo",
    nombre: "Corte + Barba",
    precio: 24,
    descripcion: "El paquete completo. Corte a tu medida y barba perfilada en una sola cita.",
    destacado: true,
  },
];