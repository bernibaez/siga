export type UserRole = 'importador' | 'verificador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rnc?: string;
  cedula: string;
  compania?: string;
  telefono: string;
  profilePicture?: string;
}

export interface Documento {
  id: string;
  nombre: string;
  tipo: string;                       // MIME type o extensión ej. application/pdf, image/jpeg
  categoria?: 'factura' | 'declaracion' | 'pago' | 'bl' | 'inspeccion' | 'otro';
  url: string;                        // URI del archivo
  fechaSubida: string;                // ISO 8601
  subidoPor: string;
  size?: number;                      // En bytes
}

export type ExpedienteEstado =
  | 'fase_1_sin_abrir'
  | 'fase_2_aprobado_verificador'
  | 'fase_3_despacho_aprobado'
  | 'registrado_aceptado'
  | 'inspeccionando'
  | 'aprobado'
  | 'despacho_aprobado'
  | 'pendiente'
  | 'revision'
  | 'pagado'
  | 'rechazado';

export interface ExpedienteImpuestos {
  itbis: number;
  selectivo: number;
  arancel: number;
  total: number;
}

export interface Expediente {
  id: string;
  numero: string;                    // Ej: "EXP-2025-001"
  declaracion: string;               // Ej: "10030-IC01-2607-00231A"
  noResultadoInspeccion?: string;    // Ej: "10030-IC10-2607-001A76"
  fechaDeclaracion?: string;         // ISO 8601 o DD/MM/YYYY
  fechaInspeccion?: string;          // ISO 8601 o DD/MM/YYYY
  administracion?: string;           // Ej: "10030 - ADMINISTRACION HAINA ORIENTAL"
  regimen?: string;                  // Ej: "GENERAL / IMPO"
  importadorId: string;
  importadorNombre: string;          // Ej: "CORPORACION MERCANTIL DOMINICANA S.R.L."
  inspectorCodigo?: string;          // Ej: "00046525"
  inspectorNombre?: string;          // Ej: "RICARDO GARCIA HERNANDEZ"
  canalControl?: 'VERDE' | 'AMARILLO' | 'ROJO' | 'Pantalla de Inspección';
  despachoTipo?: string;             // Ej: "GENERAL"
  depositoDestino?: string;          // Ej: "TERMINALES HAINA S.A."
  consignatario: string;
  agencia: string;
  estado: ExpedienteEstado;
  fechaCreacion: string;             // ISO 8601
  fechaActualizacion: string;        // ISO 8601
  valorFOB: number;
  valorCIF: number;
  peso: number;                      // En kilogramos
  mercancia: string;
  impuestos: ExpedienteImpuestos;
  documentos: Documento[];
  observaciones: string[];
}

export type IGEAEstado = 'completo' | 'incompleto';

export interface IGEA {
  id: string;
  expedienteId: string;
  numero: string;                    // Ej: "IGEA-2025-001"
  manifiesto: string;
  estado: IGEAEstado;
  fechaRegistro: string;            // ISO 8601
  observaciones: string[];
}

export type IGRAEstado = 'aprobado' | 'pendiente' | 'rechazado';

export interface IGRA {
  id: string;
  expedienteId: string;
  estado: IGRAEstado;
  fechaDespacho?: string;            // ISO 8601 (solo si está aprobado)
  documentos: Documento[];
  observaciones: string[];
}

export type CargaEstado = 'lista' | 'proceso' | 'retenida' | 'liberada';

export interface EstadoCarga {
  id: string;
  bl: string;                        // Bill of Lading
  manifiesto: string;
  codigoInterno: string;
  estado: CargaEstado;
  ubicacion: string;
  fechaActualizacion: string;        // ISO 8601
  expedienteId?: string;
}

export type PagoEstado = 'pagado' | 'pendiente' | 'parcial';

export interface Pago {
  id: string;
  expedienteId: string;
  numeroExpediente?: string;
  monto: number;                     // Monto pagado
  montoTotal: number;                // Monto total a pagar
  estado: PagoEstado;
  fechaVencimiento: string;          // ISO 8601
  fechaPago?: string;                // ISO 8601
  metodoPago?: string;
}

export type NotificacionTipo = 'expediente' | 'pago' | 'igea' | 'igra' | 'carga';

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: NotificacionTipo;
  fechaEnvio: string;                // ISO 8601
  leida: boolean;
  expedienteId?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'alonso';
  timestamp: string;
  quickActions?: {
    label: string;
    actionType: 'navigate' | 'query' | 'help';
    payload: string;
  }[];
}
