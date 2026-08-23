import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  CreditCard,
  Calendar,
  ArrowRight,
  ShieldCheck,
  FileText,
  Laptop,
  FileCheck,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';

export default function DashboardScreen() {
  const { user, isImportador } = useAuth();
  const {
    expedientes,
    pagos,
    igeas,
    igras,
    notificaciones,
    marcarTodasNotificacionesLeidas,
  } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  // Métricas calculadas
  const totalExp = expedientes.length || 4;
  const pendingExp = expedientes.filter(
    (e) =>
      e.estado === 'registrado_aceptado' ||
      e.estado === 'inspeccionando' ||
      e.estado === 'pendiente' ||
      e.estado === 'revision'
  ).length;
  const pagadosExp = expedientes.filter(
    (e) => e.estado === 'despacho_aprobado' || e.estado === 'aprobado' || e.estado === 'pagado'
  ).length;

  const totalPagos = pagos.length;
  const pendingPagos = pagos.filter((p) => p.estado !== 'pagado').length;
  const montoPendiente = pagos
    .filter((p) => p.estado !== 'pagado')
    .reduce((sum, p) => sum + (p.montoTotal - p.monto), 0);

  const igeaIncompletos = igeas.filter((i) => i.estado === 'incompleto').length;
  const igeaCompletos = igeas.length > 0 ? igeas.length - igeaIncompletos : 2;
  const igraAprobados = igras.filter((i) => i.estado === 'aprobado').length || 1;

  const unreadNotifs = notificaciones.filter((n) => !n.leida);

  // Cálculo de progreso porcentual
  const expProgress = totalExp > 0 ? Math.round((pagadosExp / totalExp) * 100) : 100;
  const igeaProgress = igeas.length > 0 ? Math.round((igeaCompletos / igeas.length) * 100) : 66;
  const igraProgress = igras.length > 0 ? Math.round((igraAprobados / (igras.length || 3)) * 100) : 33;

  // Parámetros para el Gauge Circular de SVG
  const circleSize = 100;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (expProgress || 100)) / 100;

  // Lista de Trámites en proceso para el carrusel
  const tramitesProceso = [
    {
      id: '1',
      iconType: 'calendar',
      iconBg: '#E8F5E9',
      iconColor: '#2E7D32',
      titulo: 'Zoom meet con cliente Nueva York',
      horario: '08:00 - 10:00',
      estado: 'En curso',
      badgeBg: '#E8F5E9',
      badgeColor: '#1B7F38',
      hasAvatars: true,
    },
    {
      id: '2',
      iconType: 'laptop',
      iconBg: '#FFF3E0',
      iconColor: '#E67E22',
      titulo: 'Explorar App de Diseño',
      horario: '11:00 - 12:00',
      estado: 'Pendiente',
      badgeBg: '#FFF3E0',
      badgeColor: '#D97706',
      hasAvatars: false,
    },
    {
      id: '3',
      iconType: 'document',
      iconBg: '#F3E8FF',
      iconColor: '#8B5CF6',
      titulo: 'Revisión de documentos',
      horario: '14:00 - 15:00',
      estado: 'Pendiente',
      badgeBg: '#F3E8FF',
      badgeColor: '#7C3AED',
      hasAvatars: false,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header Superior Minimalista */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShieldCheck size={26} color={COLORS.primary} strokeWidth={2.2} />
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>SIGA</Text>
            <Text style={styles.flagEmoji}>🇩🇴</Text>
          </View>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>
              {isImportador ? 'Importador OEA' : 'Oficial Verificador DGA'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={marcarTodasNotificacionesLeidas}
          style={styles.bellButton}
          activeOpacity={0.7}
        >
          <Bell size={22} color={COLORS.textPrimary} strokeWidth={1.8} />
          {unreadNotifs.length > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Saludo Limpio */}
        <View style={styles.heroSection}>
          <Text style={styles.greetingText}>
            Hola, {user?.name?.split(' ')[0] || 'Ricardo'} 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {isImportador
              ? 'Monitorea tus declaraciones y liquidaciones aduaneras en tiempo real.'
              : 'Gestión y aforo de expedientes asignados para despacho aduanal.'}
          </Text>
        </View>

        {/* Banner Principal Verde Oscuro con Medidor Circular */}
        <View style={styles.bannerHeroCard}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerSubLabel}>Expedientes pendientes</Text>
            <Text style={styles.bannerBigNumber}>{pendingExp}</Text>
            <Text style={styles.bannerDetail}>De {totalExp} registrados</Text>

            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => router.push('/(tabs)/expedientes')}
              activeOpacity={0.85}
            >
              <Text style={styles.bannerButtonText}>Ver expedientes</Text>
              <ArrowRight size={14} color="#1D4230" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.bannerRight}>
            <View style={styles.gaugeWrapper}>
              <Svg width={circleSize} height={circleSize} viewBox={`0 0 ${circleSize} ${circleSize}`}>
                {/* Círculo base tenue */}
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.18)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Arco de progreso verde brillante */}
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="#86EFAC"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
                />
              </Svg>

              <View style={styles.gaugeInnerContent}>
                <Text style={styles.gaugePercent}>{expProgress}%</Text>
                <Text style={styles.gaugeLabel}>Completados</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección: Métricas de Operación */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Métricas de Operación</Text>
          <View style={styles.dateSubtitleRow}>
            <Calendar size={13} color={COLORS.textMuted} />
            <Text style={styles.sectionSubtitle}>Enero 2025 · Recintos Portuarios RD</Text>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          {/* Card 1: Expedientes Pendientes */}
          <Card
            variant="default"
            style={styles.kpiCard}
            onPress={() => router.push('/(tabs)/expedientes')}
          >
            <View style={[styles.kpiIconBox, { backgroundColor: '#E8F5E9' }]}>
              <FileText size={18} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={styles.kpiNumber}>{pendingExp}</Text>
            <Text style={styles.kpiTitle}>Expedientes Pendientes</Text>
            <Text style={styles.kpiSub}>De {totalExp} registrados</Text>
          </Card>

          {/* Card 2: Pagos por Liquidar */}
          <Card
            variant="default"
            style={styles.kpiCard}
            onPress={() => router.push('/(tabs)/pagos')}
          >
            <View style={[styles.kpiIconBox, { backgroundColor: '#FFF3E0' }]}>
              <CreditCard size={18} color="#E67E22" strokeWidth={2} />
            </View>
            <Text style={styles.kpiNumber}>{pendingPagos}</Text>
            <Text style={styles.kpiTitle}>Pagos por Liquidar</Text>
            <Text style={styles.kpiSub}>USD ${montoPendiente.toLocaleString()}</Text>
          </Card>
        </View>

        {/* Sección: Estado de Flujos Aduaneros */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Estado de Flujos Aduaneros</Text>
          <Card variant="default" style={styles.progressCard}>
            {/* Flujo 1: Expedientes Completados */}
            <View style={styles.progressItem}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Expedientes Completados</Text>
                <Text style={styles.progressPercent}>{expProgress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${expProgress}%`, backgroundColor: '#2E7D32' }]} />
              </View>
            </View>

            {/* Flujo 2: Entrada Aduanera (IGEA) */}
            <View style={styles.progressItem}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Entrada Aduanera (IGEA)</Text>
                <Text style={styles.progressPercent}>
                  {igeaCompletos} de {igeas.length || 3}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${igeaProgress}%`,
                      backgroundColor: '#1976D2',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Flujo 3: Autorización Retiro (IGRA) */}
            <View style={[styles.progressItem, { marginBottom: 0 }]}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Autorización Retiro (IGRA)</Text>
                <Text style={styles.progressPercent}>
                  {igraAprobados} de {igras.length || 3}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${igraProgress}%`,
                      backgroundColor: '#2E7D32',
                    },
                  ]}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Sección: Trámites en Proceso (Carrusel Horizontal de Tarjetas) */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeaderRow}>
            <Text style={styles.sectionTitle}>Trámites en Proceso</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/modulos')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tramitesCarousel}
          >
            {tramitesProceso.map((tramite) => (
              <View key={tramite.id} style={styles.tramiteCard}>
                <View style={[styles.tramiteIconBox, { backgroundColor: tramite.iconBg }]}>
                  {tramite.iconType === 'calendar' && (
                    <Calendar size={16} color={tramite.iconColor} strokeWidth={2} />
                  )}
                  {tramite.iconType === 'laptop' && (
                    <Laptop size={16} color={tramite.iconColor} strokeWidth={2} />
                  )}
                  {tramite.iconType === 'document' && (
                    <FileCheck size={16} color={tramite.iconColor} strokeWidth={2} />
                  )}
                </View>

                <Text style={styles.tramiteTitle} numberOfLines={2}>
                  {tramite.titulo}
                </Text>
                <Text style={styles.tramiteHorario}>{tramite.horario}</Text>

                <View style={styles.tramiteFooter}>
                  {tramite.hasAvatars ? (
                    <View style={styles.avatarStack}>
                      <View style={[styles.avatarCircle, { backgroundColor: '#3B82F6' }]}>
                        <Text style={styles.avatarText}>JD</Text>
                      </View>
                      <View style={[styles.avatarCircle, { backgroundColor: '#10B981', marginLeft: -8 }]}>
                        <Text style={styles.avatarText}>AL</Text>
                      </View>
                      <View style={[styles.avatarCircle, { backgroundColor: '#F59E0B', marginLeft: -8 }]}>
                        <Text style={styles.avatarText}>RM</Text>
                      </View>
                    </View>
                  ) : (
                    <View />
                  )}

                  <View style={[styles.tramiteBadge, { backgroundColor: tramite.badgeBg }]}>
                    <Text style={[styles.tramiteBadgeText, { color: tramite.badgeColor }]}>
                      {tramite.estado}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 14,
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  flagEmoji: {
    fontSize: 15,
    marginLeft: 2,
  },
  roleTag: {
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 4,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B7F38',
  },
  bellButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#2E7D32',
    borderRadius: 4,
    width: 8,
    height: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  heroSection: {
    marginTop: 8,
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  bannerHeroCard: {
    backgroundColor: '#24513B',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    shadowColor: '#1B3B2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerSubLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  bannerBigNumber: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bannerDetail: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginBottom: 14,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4230',
  },
  bannerRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  gaugeWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gaugeInnerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugePercent: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  gaugeLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  dateSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  kpiCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  kpiTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  progressSection: {
    marginTop: 22,
  },
  progressCard: {
    marginTop: 12,
    padding: 18,
    borderRadius: 18,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  featuredSection: {
    marginTop: 22,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tramitesCarousel: {
    gap: 12,
    paddingRight: 10,
  },
  tramiteCard: {
    width: 175,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  tramiteIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tramiteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
    minHeight: 36,
  },
  tramiteHorario: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 12,
  },
  tramiteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  tramiteBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tramiteBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});


