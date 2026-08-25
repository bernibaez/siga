export const COLORS = {
  // Primarios institucionales Aduanas RD
  primary: '#2E7D32',        // Verde principal fresco y profesional
  primaryLight: '#E8F5E9',   // Verde claro menta tenue
  primaryDark: '#1B5E20',    // Verde institucional oscuro
  primaryDeep: '#0D3B66',    // Azul aduanero República Dominicana
  accentNavy: '#002B66',     // Azul escudo nacional RD

  // Neutros y superficies limpias (Ultra Clean & Minimal)
  neutral: '#9CA3AF',        // Gris neutro para iconos inactivos
  neutralLight: '#F3F4F6',   // Gris fondo secundario
  neutralDark: '#4B5563',    // Gris carbón medio
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  background: '#F9FAFB',     // Fondo limpio claro profesional
  surfaceSubtle: '#F4F6F8',  // Fondo de tarjetas o inputs tenue

  // Texto
  textPrimary: '#111827',    // Texto principal oscuro nítido
  textSecondary: '#4B5563',  // Texto secundario legible
  textMuted: '#9CA3AF',      // Texto tenue
  border: '#E5E7EB',         // Bordes ultra suaves y limpios
  borderLight: '#F3F4F6',    // Borde muy sutil

  // Estados
  alert: '#EF4444',          // Rojo
  alertLight: '#FEE2E2',
  warning: '#F59E0B',        // Ámbar
  warningLight: '#FEF3C7',
  info: '#3B82F6',           // Azul
  infoLight: '#DBEAFE',
  success: '#10B981',        // Verde éxito
  successLight: '#D1FAE5',

  // Sombras y superposiciones
  shadowColor: '#000000',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const STATUS_COLORS = {
  // Estados Oficiales de Gestión de Expedientes
  fase_1_sin_abrir: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Sin abrir el expediente' },
  fase_2_aprobado_verificador: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Aprobado por el verificador' },
  fase_3_despacho_aprobado: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', label: 'Despacho aprobado' },

  // Compatibilidad con registros existentes
  registrado_aceptado: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Sin abrir el expediente' },
  'registrado/aceptado': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Sin abrir el expediente' },
  inspeccionando: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Aprobado por el verificador' },
  aprobado: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Aprobado por el verificador' },
  despacho_aprobado: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', label: 'Despacho aprobado' },
  'despacho aprobado': { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', label: 'Despacho aprobado' },

  // Expedientes / Compatibilidad
  pendiente: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Sin abrir el expediente' },
  revision: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Aprobado por el verificador' },
  pagado: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', label: 'Despacho aprobado' },
  rechazado: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA', label: 'Rechazado' },

  // IGEA
  completo: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0', label: 'Completo' },
  incompleto: { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA', label: 'Incompleto' },

  // Carga
  lista: { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', label: 'Lista' },
  proceso: { bg: '#EDE9FE', text: '#6D28D9', border: '#DDD6FE', label: 'En Proceso' },
  retenida: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA', label: 'Retenida' },
  liberada: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0', label: 'Liberada' },

  // Pagos
  parcial: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Pago Parcial' },
};
