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
  Plus,
  Filter,
  FolderPlus,
  FileCheck2,
  CreditCard,
  BarChart3,
  Calendar,
  Weight,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { ExpedienteEstado } from '@/types';

type FilterTab = 'todos' | ExpedienteEstado;

export default function ExpedientesScreen() {
  const { user, isImportador } = useAuth();
  const { expedientes, pagos } = useData();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('todos');

  // Cálculos para las tarjetas de resumen
  const fase1SinAbrir = expedientes.filter(
    (e) => e.estado === 'fase_1_sin_abrir' || e.estado === 'registrado_aceptado' || e.estado === 'pendiente'
  ).length;

  const fase2Verificador = expedientes.filter(
    (e) =>
      e.estado === 'fase_2_aprobado_verificador' ||
      e.estado === 'inspeccionando' ||
      e.estado === 'revision' ||
      e.estado === 'aprobado'
  ).length;

  const fase3Despacho = expedientes.filter(
    (e) => e.estado === 'fase_3_despacho_aprobado' || e.estado === 'despacho_aprobado' || e.estado === 'pagado'
  ).length;

  const totalExp = expedientes.length;

  // Filtrado de expedientes
  const filteredExpedientes = expedientes.filter((exp) => {
    // Filtro por tab con compatibilidad de estados equivalentes
    if (activeFilter !== 'todos') {
      if (activeFilter === 'fase_1_sin_abrir') {
        if (exp.estado !== 'fase_1_sin_abrir' && exp.estado !== 'registrado_aceptado' && exp.estado !== 'pendiente') return false;
      } else if (activeFilter === 'fase_2_aprobado_verificador') {
        if (
          exp.estado !== 'fase_2_aprobado_verificador' &&
          exp.estado !== 'inspeccionando' &&
          exp.estado !== 'revision' &&
          exp.estado !== 'aprobado'
        ) return false;
      } else if (activeFilter === 'fase_3_despacho_aprobado') {
        if (exp.estado !== 'fase_3_despacho_aprobado' && exp.estado !== 'despacho_aprobado' && exp.estado !== 'pagado') return false;
      } else if (exp.estado !== activeFilter) {
        return false;
      }
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = exp.numero.toLowerCase().includes(q);
      const matchDec = exp.declaracion.toLowerCase().includes(q);
      const matchMerc = exp.mercancia.toLowerCase().includes(q);
      const matchImp = exp.importadorNombre.toLowerCase().includes(q);
      const matchCons = exp.consignatario.toLowerCase().includes(q);
      const matchAge = exp.agencia.toLowerCase().includes(q);
      return matchNum || matchDec || matchMerc || matchImp || matchCons || matchAge;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header Superior */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gestión de Declaraciones</Text>
          <Text style={styles.headerSubtitle}>
            {isImportador ? 'Mis declaraciones, facturas y aforos' : 'Declaraciones para verificación DGA'}
          </Text>
        </View>

        {isImportador && (
          <Button
            title="Nuevo"
            icon={Plus}
            size="small"
            variant="primary"
            onPress={() => router.push('/expedientes/nuevo')}
          />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Tarjetas de Resumen Superior */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryRow}
        >
          <Card variant="subtle" style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Sin Abrir</Text>
            <Text style={[styles.summaryValue, { color: '#1D4ED8' }]}>
              {fase1SinAbrir} Declaraciones
            </Text>
          </Card>

          <Card variant="subtle" style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Aprobado Verificador</Text>
            <Text style={[styles.summaryValue, { color: '#B45309' }]}>
              {fase2Verificador} Aprobados
            </Text>
          </Card>

          <Card variant="subtle" style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Despacho Aprobado</Text>
            <Text style={[styles.summaryValue, { color: COLORS.primaryDark }]}>
              {fase3Despacho} Aprobados
            </Text>
          </Card>

          <Card variant="subtle" style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Registrados</Text>
            <Text style={styles.summaryValue}>{totalExp}</Text>
          </Card>
        </ScrollView>

        {/* Acciones Rápidas */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => (isImportador ? router.push('/expedientes/nuevo') : router.push('/(tabs)/buscador'))}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <FolderPlus size={18} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.quickActionText}>{isImportador ? 'Nuevo Exp.' : 'Consultar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/(tabs)/modulos')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#E3F2FD' }]}>
              <FileCheck2 size={18} color="#1565C0" />
            </View>
            <Text style={styles.quickActionText}>Módulos IGEA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/(tabs)/pagos')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#FFF8E1' }]}>
              <CreditCard size={18} color="#F57C00" />
            </View>
            <Text style={styles.quickActionText}>Pagar Arancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/(tabs)/buscador')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#F3E5F5' }]}>
              <BarChart3 size={18} color="#7B1FA2" />
            </View>
            <Text style={styles.quickActionText}>Reportes</Text>
          </TouchableOpacity>
        </View>

        {/* Barra de Búsqueda */}
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por declaración, DUA, empresa, agencia..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Píldoras de Filtro por Estado */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsContainer}
        >
          {([
            'todos',
            'fase_1_sin_abrir',
            'fase_2_aprobado_verificador',
            'fase_3_despacho_aprobado',
            'rechazado',
          ] as FilterTab[]).map((tab) => {
            const isActive = activeFilter === tab;
            const count =
              tab === 'todos'
                ? expedientes.length
                : tab === 'fase_1_sin_abrir'
                ? fase1SinAbrir
                : tab === 'fase_2_aprobado_verificador'
                ? fase2Verificador
                : tab === 'fase_3_despacho_aprobado'
                ? fase3Despacho
                : expedientes.filter((e) => e.estado === tab).length;

            const getTabLabel = (t: FilterTab) => {
              switch (t) {
                case 'todos':
                  return 'Todos';
                case 'fase_1_sin_abrir':
                  return 'Sin abrir';
                case 'fase_2_aprobado_verificador':
                  return 'Aprobado verificador';
                case 'fase_3_despacho_aprobado':
                  return 'Despacho aprobado';
                case 'rechazado':
                  return 'Rechazado';
                default:
                  return String(t);
              }
            };

            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveFilter(tab)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {getTabLabel(tab)}
                </Text>
                <View style={[styles.pillBadge, isActive && styles.pillBadgeActive]}>
                  <Text style={[styles.pillBadgeText, isActive && styles.pillBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Lista de Tarjetas de Expedientes */}
        <View style={styles.expedientesList}>
          {filteredExpedientes.length === 0 ? (
            <Card variant="subtle" style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No se encontraron declaraciones</Text>
              <Text style={styles.emptySub}>
                Prueba ajustando los filtros o el término de búsqueda ingresado.
              </Text>
            </Card>
          ) : (
            filteredExpedientes.map((exp) => {
              const pagoAsociado = pagos.find((p) => p.expedienteId === exp.id);
              const balancePendiente = pagoAsociado
                ? pagoAsociado.montoTotal - pagoAsociado.monto
                : exp.impuestos.total;
              const estadoPago = pagoAsociado?.estado || 'pendiente';

              return (
                <Card
                  key={exp.id}
                  variant="elevated"
                  style={styles.expCard}
                  onPress={() => router.push(`/expedientes/${exp.id}` as any)}
                >
                  <View style={styles.expCardHeader}>
                    <View>
                      <Text style={styles.expNumber}>{exp.numero}</Text>
                      <Text style={styles.expDeclaracion}>DUA: {exp.declaracion}</Text>
                    </View>
                    <View style={styles.badgeCol}>
                      <StatusBadge status={exp.estado} />
                    </View>
                  </View>

                  {/* Nombre de la Empresa y Agencia */}
                  <View style={styles.companyBanner}>
                    <Text style={styles.companyNameText} numberOfLines={1}>
                      {exp.consignatario || exp.importadorNombre}
                    </Text>
                    <Text style={styles.agencyText} numberOfLines={1}>
                      🏢 {exp.agencia}
                    </Text>
                  </View>

                  <Text style={styles.expMercancia} numberOfLines={2}>
                    {exp.mercancia}
                  </Text>

                  <View style={styles.metaInfoRow}>
                    <View style={styles.metaItem}>
                      <Calendar size={13} color={COLORS.textMuted} />
                      <Text style={styles.metaText}>
                        {new Date(exp.fechaCreacion).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Weight size={13} color={COLORS.textMuted} />
                      <Text style={styles.metaText}>{exp.peso.toLocaleString()} kg</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <FileCheck2 size={13} color={COLORS.primaryDark} />
                      <Text style={[styles.metaText, { color: COLORS.primaryDark, fontWeight: '700' }]}>
                        {exp.documentos?.length || 0} Docs
                      </Text>
                    </View>
                    <View style={{ marginLeft: 'auto' }}>
                      <StatusBadge status={estadoPago} size="small" />
                    </View>
                  </View>

                  <View style={styles.expDivider} />

                  <View style={styles.expCardFooter}>
                    <View>
                      <Text style={styles.footerLabel}>Balance a Pagar</Text>
                      <Text
                        style={[
                          styles.impuestosValue,
                          balancePendiente > 0 ? { color: '#DC2626' } : { color: COLORS.primaryDark },
                        ]}
                      >
                        USD ${balancePendiente.toLocaleString()}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.footerLabel}>Total Impuestos</Text>
                      <Text style={styles.cifValue}>
                        USD ${exp.impuestos.total.toLocaleString()}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => router.push(`/expedientes/${exp.id}` as any)}
                      style={styles.viewDetailButton}
                    >
                      <Text style={styles.viewDetailText}>Ver Detalles</Text>
                      <ArrowRight size={14} color={COLORS.primaryDark} />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Botón flotante para crear declaración (solo importadores) */}
      {isImportador && (
        <TouchableOpacity
          onPress={() => router.push('/expedientes/nuevo')}
          activeOpacity={0.85}
          style={styles.floatingCreateBtn}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  summaryRow: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 10,
  },
  summaryCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 135,
    marginVertical: 0,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  filterPillsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.white,
  },
  pillBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  pillBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  pillBadgeTextActive: {
    color: COLORS.white,
  },
  expedientesList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  expCard: {
    padding: 16,
    marginVertical: 0,
  },
  expCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  badgeCol: {
    alignItems: 'flex-end',
  },
  companyBanner: {
    backgroundColor: COLORS.surfaceSubtle,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  companyNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  agencyText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  expNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  expDeclaracion: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  expMercancia: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  metaInfoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  expDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 10,
  },
  expCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  cifValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  impuestosValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 1,
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  viewDetailText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  floatingCreateBtn: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
