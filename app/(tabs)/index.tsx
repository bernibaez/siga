import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  FileText,
  Paperclip,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  Building,
  UploadCloud,
  X,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Documento } from '@/types';

export default function DashboardScreen() {
  const { user, isImportador } = useAuth();
  const {
    expedientes,
    pagos,
    igras,
    notificaciones,
    marcarTodasNotificacionesLeidas,
    addDocumentoToExpediente,
  } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAgencia, setSelectedAgencia] = useState<string>('todas');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedExpedienteId, setSelectedExpedienteId] = useState<string>('');
  const [docCategory, setDocCategory] = useState<'factura' | 'declaracion' | 'pago' | 'bl' | 'otro'>('factura');
  const [customDocName, setCustomDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  // Métricas
  const totalExp = expedientes.length || 3;
  const totalDocumentos = expedientes.reduce((sum, exp) => sum + (exp.documentos?.length || 0), 0);
  const totalFacturas = expedientes.reduce(
    (sum, exp) => sum + (exp.documentos?.filter((d) => d.categoria === 'factura' || d.nombre.toLowerCase().includes('factura')).length || 0),
    0
  );

  const pagadosExp = expedientes.filter(
    (e) =>
      e.estado === 'fase_3_despacho_aprobado' ||
      e.estado === 'despacho_aprobado' ||
      e.estado === 'aprobado' ||
      e.estado === 'pagado'
  ).length;

  const pendingPagos = pagos.filter((p) => p.estado !== 'pagado').length;
  const montoPendiente = pagos
    .filter((p) => p.estado !== 'pagado')
    .reduce((sum, p) => sum + (p.montoTotal - p.monto), 0);

  const unreadNotifs = notificaciones.filter((n) => !n.leida);

  // Agencias únicas para el filtro
  const agenciasList = ['todas', ...Array.from(new Set(expedientes.map((e) => e.agencia)))];

  // Expedientes para el dashboard (máximo 3)
  const expedientesDashboard = expedientes
    .filter((e) => selectedAgencia === 'todas' || e.agencia === selectedAgencia)
    .slice(0, 3);

  // Abrir modal de carga
  const handleOpenUploadModal = (expId?: string) => {
    setSelectedExpedienteId(expId || expedientes[0]?.id || '');
    setCustomDocName('');
    setDocCategory('factura');
    setUploadModalVisible(true);
  };

  // Procesar carga de archivo
  const handlePickAndUpload = async () => {
    if (!selectedExpedienteId) {
      Alert.alert('Selección requerida', 'Por favor selecciona una declaración.');
      return;
    }

    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const categoryLabel =
          docCategory === 'factura'
            ? 'Factura'
            : docCategory === 'declaracion'
            ? 'DUA'
            : docCategory === 'pago'
            ? 'Comprobante_Pago'
            : docCategory === 'bl'
            ? 'BL_Guia'
            : 'Documento';

        const finalName = customDocName.trim()
          ? `${customDocName.trim()}.${asset.name.split('.').pop() || 'pdf'}`
          : `${categoryLabel}_${asset.name}`;

        const newDoc: Documento = {
          id: `doc-${Date.now()}`,
          nombre: finalName,
          tipo: asset.mimeType || 'application/pdf',
          categoria: docCategory,
          url: asset.uri,
          fechaSubida: new Date().toISOString(),
          subidoPor: user?.name || 'Importador SIGA',
          size: asset.size || 512000,
        };

        await addDocumentoToExpediente(selectedExpedienteId, newDoc);
        setUploadModalVisible(false);
        Alert.alert('Documento Adjuntado', `"${newDoc.nombre}" se adjuntó correctamente.`);
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
      Alert.alert('Error', 'No se pudo cargar el archivo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Minimalista */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShieldCheck size={24} color={COLORS.primaryDark} strokeWidth={2.2} />
          <Text style={styles.brandTitle}>SIGA</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>
              {isImportador ? 'Importador' : 'Verificador'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={marcarTodasNotificacionesLeidas}
          style={styles.bellButton}
          activeOpacity={0.7}
        >
          <Bell size={20} color={COLORS.textPrimary} strokeWidth={1.8} />
          {unreadNotifs.length > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryDark]} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Saludo Breve */}
        <View style={styles.greetingBox}>
          <Text style={styles.greetingText}>
            Hola, {user?.name?.split(' ')[0] || 'Ricardo'} 👋
          </Text>
          <Text style={styles.greetingSub}>Panel de Control Aduanero</Text>
        </View>

        {/* 1. Tarjetas Principales en Grid Minimalista (2 Columnas) */}
        <View style={styles.kpiGrid}>
          {/* Tarjeta: Documentos Adjuntos */}
          <TouchableOpacity
            style={styles.cleanCard}
            onPress={() => handleOpenUploadModal()}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
                <Paperclip size={18} color="#0284C7" strokeWidth={2} />
              </View>
              <View style={styles.miniPillBlue}>
                <Plus size={10} color="#0284C7" strokeWidth={3} />
                <Text style={styles.miniPillBlueText}>Adjuntar</Text>
              </View>
            </View>
            <Text style={styles.cleanCardNumber}>{totalDocumentos}</Text>
            <Text style={styles.cleanCardTitle}>Documentos Adjuntos</Text>
            <Text style={styles.cleanCardSub}>{totalFacturas} facturas · {totalExp} DUA</Text>
          </TouchableOpacity>

          {/* Tarjeta: Balance a Pagar de Impuestos */}
          <TouchableOpacity
            style={styles.cleanCard}
            onPress={() => router.push('/(tabs)/pagos')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                <CreditCard size={18} color="#DC2626" strokeWidth={2} />
              </View>
              <View style={styles.miniPillRed}>
                <Text style={styles.miniPillRedText}>{pendingPagos} por pagar</Text>
              </View>
            </View>
            <Text style={[styles.cleanCardNumber, { color: '#DC2626' }]}>
              ${montoPendiente >= 1000 ? `${(montoPendiente / 1000).toFixed(1)}k` : montoPendiente}
            </Text>
            <Text style={styles.cleanCardTitle}>Balance Impuestos</Text>
            <Text style={styles.cleanCardSub}>USD ${montoPendiente.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta Resumen: Estado de Impuestos y Declaraciones */}
        <TouchableOpacity
          style={styles.summaryBarCard}
          onPress={() => router.push('/(tabs)/pagos')}
          activeOpacity={0.8}
        >
          <View style={styles.summaryBarLeft}>
            <View style={[styles.iconBoxSmall, { backgroundColor: '#EAF7EE' }]}>
              <Receipt size={16} color="#1B7F38" strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.summaryBarTitle}>Estado de Impuestos</Text>
              <Text style={styles.summaryBarSub}>
                {pagadosExp} de {totalExp} declaraciones liquidadas
              </Text>
            </View>
          </View>
          <View style={styles.summaryBarRight}>
            <Text style={styles.summaryBarPercent}>
              {Math.round((pagadosExp / totalExp) * 100)}%
            </Text>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </View>
        </TouchableOpacity>

        {/* 2. Sección: Actualización de Despacho (IGRA) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actualización de despacho (IGRA)</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/modulos')}>
              <Text style={styles.linkText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {igras.map((igraItem) => {
              const exp = expedientes.find((e) => e.id === igraItem.expedienteId);
              const isApproved = igraItem.estado === 'aprobado';

              return (
                <TouchableOpacity
                  key={igraItem.id}
                  style={styles.igraCardMinimal}
                  onPress={() => exp && router.push(`/expedientes/${exp.id}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.igraTopRow}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: isApproved ? '#10B981' : '#F59E0B' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.igraStatusText,
                        { color: isApproved ? '#059669' : '#D97706' },
                      ]}
                    >
                      {isApproved ? 'Despacho Autorizado' : 'Pendiente IGRA'}
                    </Text>
                  </View>

                  <Text style={styles.igraExpText}>{exp?.numero || 'DEC-2026'}</Text>
                  <Text style={styles.igraCompanyText} numberOfLines={1}>
                    {exp?.consignatario || exp?.importadorNombre || 'Empresa'}
                  </Text>

                  <View style={styles.igraBottomRow}>
                    <Text style={styles.igraAdminText} numberOfLines={1}>
                      🏢 {exp?.administracion ? exp.administracion.split('-')[1]?.trim() || exp.administracion : 'Haina Oriental'}
                    </Text>
                    <ArrowRight size={12} color={COLORS.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Sección: Historial de Declaraciones Recientes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial de Declaraciones</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/expedientes')}>
              <Text style={styles.linkText}>Ver todos ({totalExp})</Text>
            </TouchableOpacity>
          </View>

          {/* Filtro Minimalista por Agencia */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.agencyPillContainer}
          >
            {agenciasList.map((ag) => {
              const isSelected = selectedAgencia === ag;
              const label =
                ag === 'todas'
                  ? 'Todas'
                  : ag.length > 20
                  ? ag.slice(0, 18) + '...'
                  : ag;

              return (
                <TouchableOpacity
                  key={ag}
                  onPress={() => setSelectedAgencia(ag)}
                  style={[styles.pill, isSelected && styles.pillActive]}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Tarjetas de Expedientes (2 a 3) */}
          <View style={styles.expedientesColumn}>
            {expedientesDashboard.map((exp) => {
              const pagoAsociado = pagos.find((p) => p.expedienteId === exp.id);
              const balancePagar = pagoAsociado
                ? pagoAsociado.montoTotal - pagoAsociado.monto
                : exp.impuestos.total;
              const estadoPago = pagoAsociado?.estado || 'pendiente';

              return (
                <TouchableOpacity
                  key={exp.id}
                  style={styles.expCardMinimal}
                  onPress={() => router.push(`/expedientes/${exp.id}` as any)}
                  activeOpacity={0.85}
                >
                  {/* Fila 1: Número de Expediente y Estado de Pago */}
                  <View style={styles.expHeaderRow}>
                    <View style={styles.expTitleCol}>
                      <Text style={styles.expNumText}>{exp.numero}</Text>
                      <Text style={styles.expDuaText}>DUA: {exp.declaracion}</Text>
                    </View>
                    <StatusBadge status={estadoPago} size="small" />
                  </View>

                  {/* Fila 2: Empresa y Agencia */}
                  <View style={styles.expInfoBlock}>
                    <Text style={styles.expCompany} numberOfLines={1}>
                      {exp.consignatario || exp.importadorNombre}
                    </Text>
                    <Text style={styles.expAgency} numberOfLines={1}>
                      🏢 {exp.agencia}
                    </Text>
                  </View>

                  {/* Fila 3: Balance de Impuestos */}
                  <View style={styles.expBalanceRow}>
                    <Text style={styles.expBalanceLabel}>Balance a pagar de impuestos:</Text>
                    <Text
                      style={[
                        styles.expBalanceValue,
                        balancePagar > 0 ? { color: '#DC2626' } : { color: '#059669' },
                      ]}
                    >
                      USD ${balancePagar.toLocaleString()}
                    </Text>
                  </View>

                  {/* Fila 4: Documentos y Botón Adjuntar */}
                  <View style={styles.expDocsRow}>
                    <View style={styles.docChipsWrap}>
                      {exp.documentos && exp.documentos.length > 0 ? (
                        exp.documentos.slice(0, 2).map((d) => (
                          <View key={d.id} style={styles.docBadge}>
                            <FileText size={10} color="#0284C7" />
                            <Text style={styles.docBadgeText} numberOfLines={1}>
                              {d.nombre.length > 16 ? d.nombre.slice(0, 14) + '..' : d.nombre}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noDocsText}>Sin facturas</Text>
                      )}
                      {(exp.documentos?.length || 0) > 2 && (
                        <Text style={styles.moreDocsText}>+{(exp.documentos?.length || 0) - 2}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.attachBtnMinimal}
                      onPress={() => handleOpenUploadModal(exp.id)}
                      activeOpacity={0.7}
                    >
                      <Plus size={11} color={COLORS.primaryDark} strokeWidth={2.5} />
                      <Text style={styles.attachBtnMinimalText}>Adjuntar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Modal Minimalista para Adjuntar Facturas / Documentos */}
      <Modal visible={uploadModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Adjuntar Factura / Documento</Text>
                <Text style={styles.modalSub}>Selecciona el expediente y categoría</Text>
              </View>
              <TouchableOpacity
                onPress={() => setUploadModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Selector de Declaración */}
              <Text style={styles.modalFieldLabel}>Declaración</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalExpPicker}>
                {expedientes.map((e) => {
                  const isSelected = selectedExpedienteId === e.id;
                  return (
                    <TouchableOpacity
                      key={e.id}
                      onPress={() => setSelectedExpedienteId(e.id)}
                      style={[styles.modalPill, isSelected && styles.modalPillActive]}
                    >
                      <Text style={[styles.modalPillText, isSelected && styles.modalPillTextActive]}>
                        {e.numero}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Categorías */}
              <Text style={styles.modalFieldLabel}>Tipo</Text>
              <View style={styles.categoryRow}>
                {[
                  { key: 'factura', label: 'Factura Comercial' },
                  { key: 'declaracion', label: 'DUA' },
                  { key: 'pago', label: 'Pago' },
                  { key: 'bl', label: 'B/L' },
                ].map((c) => {
                  const isSelected = docCategory === c.key;
                  return (
                    <TouchableOpacity
                      key={c.key}
                      onPress={() => setDocCategory(c.key as any)}
                      style={[styles.catPill, isSelected && styles.catPillActive]}
                    >
                      <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Nombre Opcional */}
              <Text style={styles.modalFieldLabel}>Nombre Personalizado (Opcional)</Text>
              <TextInput
                style={styles.modalInput}
                value={customDocName}
                onChangeText={setCustomDocName}
                placeholder="Ej: Factura_001"
                placeholderTextColor={COLORS.textMuted}
              />

              {/* Botón Seleccionar Archivo */}
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={handlePickAndUpload}
                activeOpacity={0.8}
                disabled={isUploading}
              >
                <UploadCloud size={24} color={COLORS.primaryDark} />
                <Text style={styles.uploadAreaTitle}>
                  {isUploading ? 'Procesando...' : 'Seleccionar PDF o Imagen'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setUploadModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  roleTag: {
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 4,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B7F38',
  },
  bellButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#10B981',
    borderRadius: 4,
    width: 7,
    height: 7,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 100,
  },
  greetingBox: {
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  greetingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cleanCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPillBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniPillBlueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  miniPillRed: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniPillRedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  cleanCardNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  cleanCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  cleanCardSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  summaryBarCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  summaryBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBoxSmall: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryBarSub: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryBarPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B7F38',
  },
  sectionContainer: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  horizontalScroll: {
    gap: 10,
    paddingRight: 6,
  },
  igraCardMinimal: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  igraTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  igraStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  igraExpText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  igraCompanyText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    marginBottom: 8,
  },
  igraBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  igraAdminText: {
    fontSize: 10,
    color: '#64748B',
    flex: 1,
  },
  agencyPillContainer: {
    gap: 6,
    marginBottom: 10,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  expedientesColumn: {
    gap: 10,
  },
  expCardMinimal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expTitleCol: {
    flex: 1,
  },
  expNumText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  expDuaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  expInfoBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  expCompany: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  expAgency: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  expBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  expBalanceLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  expBalanceValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  expDocsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docChipsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  docBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F9FF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  docBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#0369A1',
  },
  noDocsText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  moreDocsText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  attachBtnMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attachBtnMinimalText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B7F38',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
    marginBottom: 4,
  },
  modalExpPicker: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  modalPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  modalPillActive: {
    backgroundColor: COLORS.primaryDark,
  },
  modalPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modalPillTextActive: {
    color: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  catPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  catPillActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 8,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryLight,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    marginVertical: 6,
  },
  uploadAreaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 4,
  },
  modalCloseBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
