import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function BuscadorScreen() {
  const { expedientes } = useData();
  const router = useRouter();

  // Estados de filtros SIGA [wcIC010801]
  const [declaracion, setDeclaracion] = useState('');
  const [inspector, setInspector] = useState('');
  const [importador, setImportador] = useState('');
  const [administracion, setAdministracion] = useState('');
  const [resultadoInspeccion, setResultadoInspeccion] = useState('');
  const [canalSelectivo, setCanalSelectivo] = useState<string>('todos');
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  const handleResetFilters = () => {
    setDeclaracion('');
    setInspector('');
    setImportador('');
    setAdministracion('');
    setResultadoInspeccion('');
    setCanalSelectivo('todos');
    setSelectedEstado('todos');
  };

  const results = expedientes.filter((exp) => {
    if (declaracion.trim() && !exp.declaracion.toLowerCase().includes(declaracion.toLowerCase())) {
      return false;
    }
    if (
      inspector.trim() &&
      !((exp.inspectorNombre || '').toLowerCase().includes(inspector.toLowerCase()) ||
        (exp.inspectorCodigo || '').toLowerCase().includes(inspector.toLowerCase()))
    ) {
      return false;
    }
    if (
      importador.trim() &&
      !exp.importadorNombre.toLowerCase().includes(importador.toLowerCase())
    ) {
      return false;
    }
    if (
      administracion.trim() &&
      !(exp.administracion || '').toLowerCase().includes(administracion.toLowerCase())
    ) {
      return false;
    }
    if (
      resultadoInspeccion.trim() &&
      !(exp.noResultadoInspeccion || '').toLowerCase().includes(resultadoInspeccion.toLowerCase())
    ) {
      return false;
    }
    if (canalSelectivo !== 'todos' && exp.canalControl !== canalSelectivo) {
      return false;
    }
    if (selectedEstado !== 'todos' && exp.estado !== selectedEstado) {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header oficial estilo SIGA DGA */}
      <View style={styles.topBar}>
        <View style={styles.breadcrumbRow}>
          <Text style={styles.breadcrumbText}>Despacho de Importación</Text>
          <ChevronRight size={12} color="#94A3B8" />
          <Text style={styles.breadcrumbText}>Inspección</Text>
          <ChevronRight size={12} color="#94A3B8" />
          <Text style={styles.breadcrumbActive}>[wcIC010801] Resultado</Text>
        </View>
        <Text style={styles.mainTitle}>Buscar Información Resultado de Inspección</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Barra de Acciones y Filtros Rápidos */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          >
            <Filter size={14} color="#002D62" />
            <Text style={styles.actionBtnTextSecondary}>
              {mostrarFiltrosAvanzados ? 'Ocultar Filtros' : 'Filtros de Búsqueda'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtnReset} onPress={handleResetFilters}>
            <RotateCcw size={14} color="#64748B" />
            <Text style={styles.actionBtnTextReset}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        {/* Panel de Formulario / Filtros SIGA */}
        <Card variant="default" style={styles.filterCard}>
          {/* No. Declaración */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>No. de Declaración (DUA)</Text>
            <View style={styles.searchBox}>
              <Search size={16} color="#64748B" style={styles.iconInside} />
              <TextInput
                style={styles.inputWithIcon}
                value={declaracion}
                onChangeText={setDeclaracion}
                placeholder="Ej: 10030-IC01-2607-00231A"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Inspector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Inspector (Código o Nombre)</Text>
            <View style={styles.searchBox}>
              <UserCheck size={16} color="#64748B" style={styles.iconInside} />
              <TextInput
                style={styles.inputWithIcon}
                value={inspector}
                onChangeText={setInspector}
                placeholder="Ej: 00046525 o RICARDO GARCIA"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {mostrarFiltrosAvanzados && (
            <>
              {/* Importador / Agencia Aduanal */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Agencia Aduanal / Importador / RNC</Text>
                <View style={styles.searchBox}>
                  <Building2 size={16} color="#64748B" style={styles.iconInside} />
                  <TextInput
                    style={styles.inputWithIcon}
                    value={importador}
                    onChangeText={setImportador}
                    placeholder="Ej: AGENCIA ADUANAL o RNC"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* No. Resultado Inspección */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>No. del Resultado de la Inspección</Text>
                <View style={styles.searchBox}>
                  <ShieldCheck size={16} color="#64748B" style={styles.iconInside} />
                  <TextInput
                    style={styles.inputWithIcon}
                    value={resultadoInspeccion}
                    onChangeText={setResultadoInspeccion}
                    placeholder="Ej: 10030-IC10-2607-001A76"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Administración */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Administración Aduanera</Text>
                <TextInput
                  style={styles.input}
                  value={administracion}
                  onChangeText={setAdministracion}
                  placeholder="Ej: 10030 o HAINA ORIENTAL"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </>
          )}

          {/* Filtro de Canal de Selectividad (S/C) */}
          <Text style={[styles.label, { marginTop: 10 }]}>S/C (Canal de Selectividad)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
            {['todos', 'Pantalla de Inspección', 'VERDE', 'AMARILLO', 'ROJO'].map((canal) => {
              const isActive = canalSelectivo === canal;
              return (
                <TouchableOpacity
                  key={canal}
                  onPress={() => setCanalSelectivo(canal)}
                  style={[
                    styles.pill,
                    isActive && styles.pillActive,
                    canal === 'ROJO' && isActive && styles.pillRed,
                    canal === 'VERDE' && isActive && styles.pillGreen,
                  ]}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {canal === 'todos' ? 'Todos' : canal}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Filtro de Estado */}
          <Text style={[styles.label, { marginTop: 10 }]}>Estado del Trámite</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
            {[
              'todos',
              'registrado_aceptado',
              'inspeccionando',
              'aprobado',
              'despacho_aprobado',
              'rechazado',
            ].map((est) => {
              const isActive = selectedEstado === est;
              const getEstLabel = (s: string) => {
                switch (s) {
                  case 'todos':
                    return 'Todos';
                  case 'registrado_aceptado':
                    return 'Registrado/Aceptado';
                  case 'inspeccionando':
                    return 'Inspeccionando';
                  case 'aprobado':
                    return 'Aprobado';
                  case 'despacho_aprobado':
                    return 'Despacho Aprobado';
                  case 'rechazado':
                    return 'Rechazado';
                  default:
                    return s;
                }
              };

              return (
                <TouchableOpacity
                  key={est}
                  onPress={() => setSelectedEstado(est)}
                  style={[styles.pill, isActive && styles.pillActive]}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {getEstLabel(est)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        {/* Encabezado de la Grilla de Resultados */}
        <View style={styles.resultsHeaderRow}>
          <Text style={styles.resultsTitle}>
            Resultados de Inspección ({results.length})
          </Text>
          <Text style={styles.pageBadge}>Total page: 1</Text>
        </View>

        {/* Lista de Registros (Grilla SIGA adaptada a Móvil) */}
        {results.length === 0 ? (
          <Card variant="subtle" style={styles.emptyCard}>
            <ShieldCheck size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No se hallaron resultados de inspección</Text>
            <Text style={styles.emptySub}>
              Verifica los criterios ingresados o limpia los filtros.
            </Text>
          </Card>
        ) : (
          results.map((exp, index) => (
            <TouchableOpacity
              key={exp.id}
              style={styles.inspectionCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/expedientes/${exp.id}` as any)}
            >
              {/* Encabezado del Registro con Secuencia */}
              <View style={styles.cardTop}>
                <View style={styles.secBadge}>
                  <Text style={styles.secText}>Sec. {index + 1}</Text>
                </View>
                <View style={styles.channelTag}>
                  <Text style={styles.channelText}>{exp.canalControl || 'Inspección'}</Text>
                </View>
                <StatusBadge status={exp.estado} size="small" style={{ marginLeft: 'auto' }} />
              </View>

              {/* No. Declaración y Resultado */}
              <View style={styles.dataBlock}>
                <Text style={styles.decLabel}>No. de Declaración</Text>
                <Text style={styles.decNumber}>{exp.declaracion}</Text>
              </View>

              {exp.noResultadoInspeccion && (
                <View style={styles.dataBlockSmall}>
                  <Text style={styles.smallLabel}>No. Resultado Inspección:</Text>
                  <Text style={styles.smallValueBold}>{exp.noResultadoInspeccion}</Text>
                </View>
              )}

              {/* Grid de Inspector y Fechas */}
              <View style={styles.infoGrid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Inspector DGA</Text>
                  <Text style={styles.gridValue}>
                    {exp.inspectorNombre
                      ? `${exp.inspectorCodigo ? exp.inspectorCodigo + ' - ' : ''}${exp.inspectorNombre}`
                      : 'Por asignar'}
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Fecha Declara / Insp.</Text>
                  <Text style={styles.gridValue}>
                    {exp.fechaDeclaracion || new Date(exp.fechaCreacion).toLocaleDateString()}
                    {exp.fechaInspeccion ? ` ~ ${exp.fechaInspeccion}` : ''}
                  </Text>
                </View>
              </View>

              {/* Importador y Depósito */}
              <View style={styles.footerDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.footerLabel}>Importador:</Text>
                  <Text style={styles.footerValue} numberOfLines={1}>
                    {exp.importadorNombre}
                  </Text>
                </View>

                {exp.depositoDestino && (
                  <View style={styles.detailRow}>
                    <Text style={styles.footerLabel}>Depósito:</Text>
                    <Text style={styles.footerValue} numberOfLines={1}>
                      {exp.depositoDestino}
                    </Text>
                  </View>
                )}

                {exp.administracion && (
                  <View style={styles.detailRow}>
                    <Text style={styles.footerLabel}>Administración:</Text>
                    <Text style={styles.footerValue} numberOfLines={1}>
                      {exp.administracion}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooterAction}>
                <Text style={styles.viewDetailLink}>Ver Ficha de Inspección Completa</Text>
                <ArrowRight size={14} color="#002D62" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  topBar: {
    backgroundColor: '#002D62',
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  breadcrumbText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  breadcrumbActive: {
    fontSize: 10,
    color: '#78BE20',
    fontWeight: '700',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnTextSecondary: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002D62',
  },
  actionBtnReset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  actionBtnTextReset: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterCard: {
    padding: 14,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    height: 38,
  },
  iconInside: {
    marginRight: 6,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: '#0F172A',
  },
  pillsRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 6,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: '#002D62',
    borderColor: '#002D62',
  },
  pillRed: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  pillGreen: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  pageBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  inspectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  secBadge: {
    backgroundColor: '#002D62',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  secText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  channelTag: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  channelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  dataBlock: {
    marginBottom: 4,
  },
  decLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  decNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#002D62',
    letterSpacing: 0.2,
  },
  dataBlockSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  smallValueBold: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  footerDetails: {
    gap: 2,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    width: 90,
  },
  footerValue: {
    fontSize: 10,
    color: '#334155',
    flex: 1,
  },
  cardFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  viewDetailLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#002D62',
  },
});
