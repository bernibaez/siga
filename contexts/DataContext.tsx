import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Expediente,
  IGEA,
  IGRA,
  EstadoCarga,
  Pago,
  Notificacion,
  ExpedienteEstado,
  IGEAEstado,
  IGRAEstado,
  CargaEstado,
  PagoEstado,
} from '@/types';

interface DataContextType {
  expedientes: Expediente[];
  igeas: IGEA[];
  igras: IGRA[];
  cargas: EstadoCarga[];
  pagos: Pago[];
  notificaciones: Notificacion[];
  isLoadingData: boolean;
  addExpediente: (nuevo: Omit<Expediente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => Promise<Expediente>;
  updateExpedienteEstado: (id: string, nuevoEstado: ExpedienteEstado, observacion?: string) => Promise<void>;
  updateIGEA: (id: string, estado: IGEAEstado, observacion?: string) => Promise<void>;
  updateIGRA: (id: string, estado: IGRAEstado, observacion?: string) => Promise<void>;
  updateCarga: (id: string, estado: CargaEstado, ubicacion?: string) => Promise<void>;
  confirmarPago: (pagoId: string) => Promise<void>;
  realizarPago: (pagoId: string, montoAbonado: number, metodo: string) => Promise<void>;
  marcarNotificacionLeida: (id: string) => Promise<void>;
  marcarTodasNotificacionesLeidas: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const STORAGE_KEYS = {
  EXPEDIENTES: '@siga_expedientes_v3',
  IGEAS: '@siga_igeas_v3',
  IGRAS: '@siga_igras_v3',
  CARGAS: '@siga_cargas_v3',
  PAGOS: '@siga_pagos_v3',
  NOTIFICACIONES: '@siga_notificaciones_v3',
};

const INITIAL_EXPEDIENTES: Expediente[] = [
  {
    id: 'exp-001',
    numero: 'EXP-2026-001',
    declaracion: '10030-IC01-2607-00231A',
    noResultadoInspeccion: '10030-IC10-2607-001A76',
    fechaDeclaracion: '14/07/2026',
    fechaInspeccion: '15/07/2026',
    administracion: '10030 - ADMINISTRACION HAINA ORIENTAL',
    regimen: 'DESPACHO A CONSUMO',
    importadorId: 'usr-imp-01',
    importadorNombre: 'CORPORACION MERCANTIL DOMINICANA S.R.L.',
    inspectorCodigo: '00046525',
    inspectorNombre: 'RICARDO GARCIA HERNANDEZ',
    canalControl: 'Pantalla de Inspección',
    despachoTipo: 'GENERAL',
    depositoDestino: 'TERMINALES HAINA S.A.',
    consignatario: 'CORPORACION MERCANTIL DOMINICANA S.R.L.',
    agencia: 'Agencia Aduanal Dominicana Express',
    estado: 'registrado_aceptado',
    fechaCreacion: '2026-07-14T09:30:00Z',
    fechaActualizacion: '2026-07-15T11:20:00Z',
    valorFOB: 45000,
    valorCIF: 48500,
    peso: 1850,
    mercancia: 'Equipos electrónicos y servidores de telecomunicaciones',
    impuestos: {
      itbis: 8730,
      selectivo: 0,
      arancel: 9700,
      total: 18430,
    },
    documentos: [
      {
        id: 'doc-1',
        nombre: 'DUA_Declaracion_10030_00231A.pdf',
        tipo: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fechaSubida: '2026-07-14T09:35:00Z',
        subidoPor: 'Ricardo García',
        size: 1048576,
      },
      {
        id: 'doc-2',
        nombre: 'BL_Haina_Terminales_99812.pdf',
        tipo: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fechaSubida: '2026-07-14T09:36:00Z',
        subidoPor: 'Ricardo García',
        size: 524288,
      },
      {
        id: 'doc-3',
        nombre: 'Acta_Inspeccion_Fisica_DGA.pdf',
        tipo: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fechaSubida: '2026-07-15T09:37:00Z',
        subidoPor: 'RICARDO GARCIA HERNANDEZ',
        size: 786432,
      },
    ],
    observaciones: [
      'Declaración registrada y aceptada en Sistema SIGA DGA.',
      'Asignada a Inspector 00046525 RICARDO GARCIA HERNANDEZ.',
      'S/C: Pantalla de Inspección en Terminales Haina Oriental.',
    ],
  },
  {
    id: 'exp-002',
    numero: 'EXP-2026-002',
    declaracion: '10030-ic01-2607-002bcd',
    noResultadoInspeccion: '10030-IC10-2607-002154',
    fechaDeclaracion: '17/07/2026',
    fechaInspeccion: '18/07/2026',
    administracion: '10030 - ADMINISTRACION HAINA ORIENTAL',
    regimen: 'DESPACHO A CONSUMO',
    importadorId: 'usr-imp-01',
    importadorNombre: 'INDUSTRIAS NACIONALES S.A.',
    inspectorCodigo: '00046525',
    inspectorNombre: 'RICARDO GARCIA HERNANDEZ',
    canalControl: 'ROJO',
    despachoTipo: 'GENERAL',
    depositoDestino: 'TERMINALES HAINA S.A.',
    consignatario: 'Industrias Nacionales S.A.',
    agencia: 'Servicios Aduaneros Globales RD',
    estado: 'inspeccionando',
    fechaCreacion: '2026-07-17T14:15:00Z',
    fechaActualizacion: '2026-07-18T16:00:00Z',
    valorFOB: 28000,
    valorCIF: 31200,
    peso: 3400,
    mercancia: 'Repuestos automotrices y piezas de suspensión pesada',
    impuestos: {
      itbis: 5616,
      selectivo: 1560,
      arancel: 6240,
      total: 13416,
    },
    documentos: [
      {
        id: 'doc-4',
        nombre: 'Factura_Repuestos_2026.pdf',
        tipo: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fechaSubida: '2026-07-17T14:20:00Z',
        subidoPor: 'Ricardo García',
        size: 854000,
      },
      {
        id: 'doc-5',
        nombre: 'Inspeccion_Fisica_Haina.pdf',
        tipo: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fechaSubida: '2026-07-18T11:00:00Z',
        subidoPor: 'RICARDO GARCIA HERNANDEZ',
        size: 1200000,
      },
    ],
    observaciones: [
      'Proceso de inspección física y documental en curso.',
      'Inspector asignado en patio: RICARDO GARCIA HERNANDEZ.',
      'Aforo físico en patio de Terminales Haina Oriental.',
    ],
  },
  {
    id: 'exp-003',
    numero: 'EXP-2026-003',
    declaracion: '10030-IC01-2607-00231A',
    noResultadoInspeccion: '10030-IC10-2607-001A76',
    fechaDeclaracion: '05/06/2026',
    fechaInspeccion: '06/06/2026',
    administracion: '10030 - ADMINISTRACION HAINA ORIENTAL',
    regimen: 'DESPACHO A CONSUMO',
    importadorId: 'usr-imp-01',
    importadorNombre: 'CORPORACION DIGITAL SRL',
    inspectorCodigo: '00046525',
    inspectorNombre: 'RICARDO GARCIA HERNANDEZ',
    canalControl: 'Pantalla de Inspección',
    despachoTipo: 'GENERAL',
    depositoDestino: 'TERMINALES HAINA S.A.',
    consignatario: 'Corporacion Digital SRL',
    agencia: 'RAISA WENDY NIVAR C...',
    estado: 'despacho_aprobado',
    fechaCreacion: '2026-06-05T08:00:00Z',
    fechaActualizacion: '2026-06-08T10:45:00Z',
    valorFOB: 62000,
    valorCIF: 67400,
    peso: 5200,
    mercancia: 'Materia prima tecnológica e infraestructura digital',
    impuestos: {
      itbis: 12132,
      selectivo: 0,
      arancel: 6740,
      total: 18872,
    },
    documentos: [
      {
        id: 'doc-6',
        nombre: 'Comprobante_Pago_SIGA_003.pdf',
        tipo: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fechaSubida: '2026-06-08T10:40:00Z',
        subidoPor: 'Ricardo García',
        size: 610000,
      },
    ],
    observaciones: [
      'Aforo verde automático liberado por sistema.',
      'Pago liquidado exitosamente mediante débito bancario SIGA.',
      'Despacho Aprobado para retiro en Terminales Haina S.A.',
    ],
  },
  {
    id: 'exp-004',
    numero: 'EXP-2026-004',
    declaracion: '10040-IC01-2607-00412E',
    noResultadoInspeccion: '10040-IC10-2607-001890',
    fechaDeclaracion: '08/07/2026',
    fechaInspeccion: '09/07/2026',
    administracion: '10040 - ADM. PUERTO MULTIMODAL CAUCEDO',
    regimen: 'DESPACHO A CONSUMO',
    importadorId: 'usr-imp-01',
    importadorNombre: 'CARIBE IMPORT LOGISTICS S.R.L.',
    inspectorCodigo: '00038910',
    inspectorNombre: 'LIC. MARIA GONZALEZ',
    canalControl: 'AMARILLO',
    despachoTipo: 'GENERAL',
    depositoDestino: 'DP WORLD CAUCEDO TERMINAL',
    consignatario: 'Caribe Import Logistics S.R.L.',
    agencia: 'Servicios Aduaneros Globales RD',
    estado: 'aprobado',
    fechaCreacion: '2026-07-08T09:00:00Z',
    fechaActualizacion: '2026-07-09T17:30:00Z',
    valorFOB: 34500,
    valorCIF: 38200,
    peso: 2100,
    mercancia: 'Módulos solares e inversores de energía renovable',
    impuestos: {
      itbis: 6876,
      selectivo: 0,
      arancel: 0,
      total: 6876,
    },
    documentos: [],
    observaciones: [
      'Resultado de inspección validado y Aprobado.',
      'Exoneración arancelaria aplicada conforme Ley 57-07.',
      'Pendiente de emisión de pase de salida / levante.',
    ],
  },
];

const INITIAL_IGEAS: IGEA[] = [
  {
    id: 'igea-001',
    expedienteId: 'exp-001',
    numero: 'IGEA-2025-001',
    manifiesto: 'MAN-2025-CAUC-0941',
    estado: 'incompleto',
    fechaRegistro: '2025-01-14T10:00:00Z',
    observaciones: ['Pendiente de confirmación de descarga en muelle 4.'],
  },
  {
    id: 'igea-002',
    expedienteId: 'exp-002',
    numero: 'IGEA-2025-002',
    manifiesto: 'MAN-2025-HAIN-1120',
    estado: 'completo',
    fechaRegistro: '2025-01-11T09:15:00Z',
    observaciones: ['Ingreso a patio aduanero validado y tarjado.'],
  },
  {
    id: 'igea-003',
    expedienteId: 'exp-003',
    numero: 'IGEA-2025-003',
    manifiesto: 'MAN-2025-CAUC-0812',
    estado: 'completo',
    fechaRegistro: '2025-01-05T11:00:00Z',
    observaciones: ['Ingreso conforme sin novedades.'],
  },
];

const INITIAL_IGRAS: IGRA[] = [
  {
    id: 'igra-001',
    expedienteId: 'exp-001',
    estado: 'pendiente',
    documentos: [],
    observaciones: ['Esperando liquidación y pago de gravámenes para emisión de pase de salida.'],
  },
  {
    id: 'igra-002',
    expedienteId: 'exp-002',
    estado: 'pendiente',
    documentos: [],
    observaciones: ['A la espera de conclusión de aforo físico para emitir autorización de retiro.'],
  },
  {
    id: 'igra-003',
    expedienteId: 'exp-003',
    estado: 'aprobado',
    fechaDespacho: '2025-01-08T11:30:00Z',
    documentos: [],
    observaciones: ['Despacho aduanero autorizado. Conduce de salida emitido #DS-9921.'],
  },
];

const INITIAL_CARGAS: EstadoCarga[] = [
  {
    id: 'crg-001',
    bl: 'MEDU99201481',
    manifiesto: 'MAN-2025-CAUC-0941',
    codigoInterno: 'CTNR-4491-RD',
    estado: 'proceso',
    ubicacion: 'DP World Caucedo - Bloque B-12',
    fechaActualizacion: '2025-01-15T09:00:00Z',
    expedienteId: 'exp-001',
  },
  {
    id: 'crg-002',
    bl: 'HLCU20251108',
    manifiesto: 'MAN-2025-HAIN-1120',
    codigoInterno: 'CTNR-7721-RD',
    estado: 'lista',
    ubicacion: 'HIT Puerto Río Haina - Nave 3',
    fechaActualizacion: '2025-01-16T15:30:00Z',
    expedienteId: 'exp-002',
  },
  {
    id: 'crg-003',
    bl: 'MAEU88192033',
    manifiesto: 'MAN-2025-CAUC-0812',
    codigoInterno: 'CTNR-1029-RD',
    estado: 'liberada',
    ubicacion: 'Entregada en Almacén Fiscal - Sto Dgo',
    fechaActualizacion: '2025-01-08T12:00:00Z',
    expedienteId: 'exp-003',
  },
];

const INITIAL_PAGOS: Pago[] = [
  {
    id: 'pag-001',
    expedienteId: 'exp-001',
    numeroExpediente: 'EXP-2025-001',
    monto: 0,
    montoTotal: 18430,
    estado: 'pendiente',
    fechaVencimiento: '2025-01-25T23:59:59Z',
  },
  {
    id: 'pag-002',
    expedienteId: 'exp-002',
    numeroExpediente: 'EXP-2025-002',
    monto: 5000,
    montoTotal: 13416,
    estado: 'parcial',
    fechaVencimiento: '2025-01-22T23:59:59Z',
    fechaPago: '2025-01-14T10:30:00Z',
    metodoPago: 'Transferencia ACH Banco de Reservas',
  },
  {
    id: 'pag-003',
    expedienteId: 'exp-003',
    numeroExpediente: 'EXP-2025-003',
    monto: 18872,
    montoTotal: 18872,
    estado: 'pagado',
    fechaVencimiento: '2025-01-10T23:59:59Z',
    fechaPago: '2025-01-08T10:45:00Z',
    metodoPago: 'Pago Electrónico SIGA - Tarjeta Corporativa',
  },
];

const INITIAL_NOTIFICACIONES: Notificacion[] = [
  {
    id: 'notif-001',
    titulo: 'Nuevo Expediente Asignado',
    mensaje: 'El expediente EXP-2025-001 fue recibido en el sistema y requiere validación.',
    tipo: 'expediente',
    fechaEnvio: '2025-01-14T09:30:00Z',
    leida: false,
    expedienteId: 'exp-001',
  },
  {
    id: 'notif-002',
    titulo: 'Aforo Físico Completado',
    mensaje: 'La inspección física del expediente EXP-2025-002 en Caucedo ha finalizado satisfactoriamente.',
    tipo: 'carga',
    fechaEnvio: '2025-01-12T11:05:00Z',
    leida: false,
    expedienteId: 'exp-002',
  },
  {
    id: 'notif-003',
    titulo: 'Autorización IGRA Aprobada',
    mensaje: 'El expediente EXP-2025-003 cuenta con pase de salida autorizado para retiro inmediato.',
    tipo: 'igra',
    fechaEnvio: '2025-01-08T11:35:00Z',
    leida: true,
    expedienteId: 'exp-003',
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expedientes, setExpedientes] = useState<Expediente[]>(INITIAL_EXPEDIENTES);
  const [igeas, setIgeas] = useState<IGEA[]>(INITIAL_IGEAS);
  const [igras, setIgras] = useState<IGRA[]>(INITIAL_IGRAS);
  const [cargas, setCargas] = useState<EstadoCarga[]>(INITIAL_CARGAS);
  const [pagos, setPagos] = useState<Pago[]>(INITIAL_PAGOS);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(INITIAL_NOTIFICACIONES);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [storedExp, storedIgea, storedIgra, storedCarga, storedPagos, storedNotif] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXPEDIENTES),
        AsyncStorage.getItem(STORAGE_KEYS.IGEAS),
        AsyncStorage.getItem(STORAGE_KEYS.IGRAS),
        AsyncStorage.getItem(STORAGE_KEYS.CARGAS),
        AsyncStorage.getItem(STORAGE_KEYS.PAGOS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICACIONES),
      ]);

      if (storedExp) setExpedientes(JSON.parse(storedExp));
      else await AsyncStorage.setItem(STORAGE_KEYS.EXPEDIENTES, JSON.stringify(INITIAL_EXPEDIENTES));

      if (storedIgea) setIgeas(JSON.parse(storedIgea));
      else await AsyncStorage.setItem(STORAGE_KEYS.IGEAS, JSON.stringify(INITIAL_IGEAS));

      if (storedIgra) setIgras(JSON.parse(storedIgra));
      else await AsyncStorage.setItem(STORAGE_KEYS.IGRAS, JSON.stringify(INITIAL_IGRAS));

      if (storedCarga) setCargas(JSON.parse(storedCarga));
      else await AsyncStorage.setItem(STORAGE_KEYS.CARGAS, JSON.stringify(INITIAL_CARGAS));

      if (storedPagos) setPagos(JSON.parse(storedPagos));
      else await AsyncStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(INITIAL_PAGOS));

      if (storedNotif) setNotificaciones(JSON.parse(storedNotif));
      else await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(INITIAL_NOTIFICACIONES));
    } catch (error) {
      console.error('Error cargando datos de AsyncStorage:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const addExpediente = async (
    nuevo: Omit<Expediente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>
  ): Promise<Expediente> => {
    const id = `exp-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();
    const createdExpediente: Expediente = {
      ...nuevo,
      id,
      fechaCreacion: nowIso,
      fechaActualizacion: nowIso,
    };

    const newExpedientes = [createdExpediente, ...expedientes];
    setExpedientes(newExpedientes);
    await AsyncStorage.setItem(STORAGE_KEYS.EXPEDIENTES, JSON.stringify(newExpedientes));

    // Crear automáticamente IGEA asociado
    const newIgea: IGEA = {
      id: `igea-${id}`,
      expedienteId: id,
      numero: `IGEA-2025-${id.replace('exp-', '')}`,
      manifiesto: `MAN-2025-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      estado: 'incompleto',
      fechaRegistro: nowIso,
      observaciones: ['Generado automáticamente al registrar expediente.'],
    };
    const newIgeas = [newIgea, ...igeas];
    setIgeas(newIgeas);
    await AsyncStorage.setItem(STORAGE_KEYS.IGEAS, JSON.stringify(newIgeas));

    // Crear automáticamente IGRA asociado
    const newIgra: IGRA = {
      id: `igra-${id}`,
      expedienteId: id,
      estado: 'pendiente',
      documentos: [],
      observaciones: ['Pendiente de proceso y liquidación aduanera.'],
    };
    const newIgras = [newIgra, ...igras];
    setIgras(newIgras);
    await AsyncStorage.setItem(STORAGE_KEYS.IGRAS, JSON.stringify(newIgras));

    // Crear Estado de Carga asociado
    const newCarga: EstadoCarga = {
      id: `crg-${id}`,
      bl: `BL-RD-${Math.floor(1000000 + Math.random() * 9000000)}`,
      manifiesto: newIgea.manifiesto,
      codigoInterno: `CTNR-${id.replace('exp-', '')}-RD`,
      estado: 'proceso',
      ubicacion: 'Terminal de Carga Caucedo - Área de Espera',
      fechaActualizacion: nowIso,
      expedienteId: id,
    };
    const newCargas = [newCarga, ...cargas];
    setCargas(newCargas);
    await AsyncStorage.setItem(STORAGE_KEYS.CARGAS, JSON.stringify(newCargas));

    // Crear Pago asociado
    const newPago: Pago = {
      id: `pag-${id}`,
      expedienteId: id,
      numeroExpediente: createdExpediente.numero,
      monto: 0,
      montoTotal: createdExpediente.impuestos.total,
      estado: 'pendiente',
      fechaVencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const newPagos = [newPago, ...pagos];
    setPagos(newPagos);
    await AsyncStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(newPagos));

    // Crear notificación
    const newNotif: Notificacion = {
      id: `notif-${Date.now()}`,
      titulo: 'Expediente Registrado con Éxito',
      mensaje: `Se ha generado el expediente ${createdExpediente.numero} por un valor CIF de USD $${createdExpediente.valorCIF.toLocaleString()}.`,
      tipo: 'expediente',
      fechaEnvio: nowIso,
      leida: false,
      expedienteId: id,
    };
    const newNotifs = [newNotif, ...notificaciones];
    setNotificaciones(newNotifs);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(newNotifs));

    return createdExpediente;
  };

  const updateExpedienteEstado = async (id: string, nuevoEstado: ExpedienteEstado, observacion?: string) => {
    const updated = expedientes.map((exp) => {
      if (exp.id === id) {
        return {
          ...exp,
          estado: nuevoEstado,
          fechaActualizacion: new Date().toISOString(),
          observaciones: observacion ? [observacion, ...exp.observaciones] : exp.observaciones,
        };
      }
      return exp;
    });
    setExpedientes(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.EXPEDIENTES, JSON.stringify(updated));
  };

  const updateIGEA = async (id: string, estado: IGEAEstado, observacion?: string) => {
    const updated = igeas.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          estado,
          observaciones: observacion ? [observacion, ...item.observaciones] : item.observaciones,
        };
      }
      return item;
    });
    setIgeas(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.IGEAS, JSON.stringify(updated));
  };

  const updateIGRA = async (id: string, estado: IGRAEstado, observacion?: string) => {
    const updated = igras.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          estado,
          fechaDespacho: estado === 'aprobado' ? new Date().toISOString() : item.fechaDespacho,
          observaciones: observacion ? [observacion, ...item.observaciones] : item.observaciones,
        };
      }
      return item;
    });
    setIgras(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.IGRAS, JSON.stringify(updated));
  };

  const updateCarga = async (id: string, estado: CargaEstado, ubicacion?: string) => {
    const updated = cargas.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          estado,
          ubicacion: ubicacion || item.ubicacion,
          fechaActualizacion: new Date().toISOString(),
        };
      }
      return item;
    });
    setCargas(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CARGAS, JSON.stringify(updated));
  };

  const confirmarPago = async (pagoId: string) => {
    let expIdToUpdate: string | undefined;

    const updatedPagos = pagos.map((p) => {
      if (p.id === pagoId) {
        expIdToUpdate = p.expedienteId;
        return {
          ...p,
          monto: p.montoTotal,
          estado: 'pagado' as PagoEstado,
          fechaPago: new Date().toISOString(),
          metodoPago: p.metodoPago || 'Validado por Oficial de Caja DGA',
        };
      }
      return p;
    });

    setPagos(updatedPagos);
    await AsyncStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(updatedPagos));

    if (expIdToUpdate) {
      await updateExpedienteEstado(expIdToUpdate, 'pagado', 'Pago verificado y validado por oficial DGA.');
    }
  };

  const realizarPago = async (pagoId: string, montoAbonado: number, metodo: string) => {
    let expIdToUpdate: string | undefined;
    let esTotal = false;

    const updatedPagos = pagos.map((p) => {
      if (p.id === pagoId) {
        expIdToUpdate = p.expedienteId;
        const nuevoMonto = Math.min(p.montoTotal, p.monto + montoAbonado);
        esTotal = nuevoMonto >= p.montoTotal;
        const nuevoEstado: PagoEstado = esTotal ? 'pagado' : 'parcial';

        return {
          ...p,
          monto: nuevoMonto,
          estado: nuevoEstado,
          fechaPago: new Date().toISOString(),
          metodoPago: metodo,
        };
      }
      return p;
    });

    setPagos(updatedPagos);
    await AsyncStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(updatedPagos));

    if (expIdToUpdate && esTotal) {
      await updateExpedienteEstado(expIdToUpdate, 'pagado', `Pago liquidado exitosamente mediante ${metodo}.`);
    }
  };

  const marcarNotificacionLeida = async (id: string) => {
    const updated = notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n));
    setNotificaciones(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(updated));
  };

  const marcarTodasNotificacionesLeidas = async () => {
    const updated = notificaciones.map((n) => ({ ...n, leida: true }));
    setNotificaciones(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(updated));
  };

  const resetToDefaults = async () => {
    setExpedientes(INITIAL_EXPEDIENTES);
    setIgeas(INITIAL_IGEAS);
    setIgras(INITIAL_IGRAS);
    setCargas(INITIAL_CARGAS);
    setPagos(INITIAL_PAGOS);
    setNotificaciones(INITIAL_NOTIFICACIONES);

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.EXPEDIENTES, JSON.stringify(INITIAL_EXPEDIENTES)],
      [STORAGE_KEYS.IGEAS, JSON.stringify(INITIAL_IGEAS)],
      [STORAGE_KEYS.IGRAS, JSON.stringify(INITIAL_IGRAS)],
      [STORAGE_KEYS.CARGAS, JSON.stringify(INITIAL_CARGAS)],
      [STORAGE_KEYS.PAGOS, JSON.stringify(INITIAL_PAGOS)],
      [STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(INITIAL_NOTIFICACIONES)],
    ]);
  };

  return (
    <DataContext.Provider
      value={{
        expedientes,
        igeas,
        igras,
        cargas,
        pagos,
        notificaciones,
        isLoadingData,
        addExpediente,
        updateExpedienteEstado,
        updateIGEA,
        updateIGRA,
        updateCarga,
        confirmarPago,
        realizarPago,
        marcarNotificacionLeida,
        marcarTodasNotificacionesLeidas,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};
