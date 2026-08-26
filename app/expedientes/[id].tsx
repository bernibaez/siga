import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Weight,
  DollarSign,
  Package,
  Building,
  FileText,
  Ship,
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Activity,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { FilePreview } from '@/components/ui/FilePreview';
import { FileUpload } from '@/components/ui/FileUpload';
import { Documento, ExpedienteEstado } from '@/types';

const SIGA_STAGES = [
  { key: 'fase_1_sin_abrir', label: 'Sin abrir el expediente', shortLabel: 'Sin abrir', desc: 'Declaración registrada' },
  { key: 'fase_2_aprobado_verificador', label: 'Aprobado por el verificador', shortLabel: 'Aprobado verificador', desc: 'Aprobado por el verificador' },
  { key: 'fase_3_despacho_aprobado', label: 'Despacho aprobado', shortLabel: 'Despacho aprobado', desc: 'Levante autorizado' },
];

export default function DetalleExpedienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isImportador, isVerificador } = useAuth();
  const {
    expedientes,
    igeas,
    igras,
    cargas,
    pagos,
    updateExpedienteEstado,
    addDocumentoToExpediente,
    removeDocumentoFromExpediente,
  } = useData();

  const expediente = expedientes.find((e) => e.id === id);
  const igea = igeas.find((i) => i.expedienteId === id);
  const igra = igras.find((i) => i.expedienteId === id);
  const carga = cargas.find((c) => c.expedienteId === id);
  const pago = pagos.find((p) => p.expedienteId === id);

  const [documentosLocales, setDocumentosLocales] = useState<Documento[]>(
    expediente?.documentos || []
  );

  // Keep in sync with expediente documents
  React.useEffect(() => {
    if (expediente?.documentos) {
      setDocumentosLocales(expediente.documentos);
    }
  }, [expediente?.documentos]);

  if (!expediente) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Expediente no encontrado</Text>
        <Button
          title="Regresar a Expedientes"
          variant="outline"
          onPress={() => router.back()}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  const getStageIndex = (estado: string) => {
    switch (estado) {
      case 'fase_1_sin_abrir':
      case 'registrado_aceptado':
      case 'pendiente':
        return 0;
      case 'fase_2_aprobado_verificador':
      case 'inspeccionando':
      case 'revision':
      case 'aprobado':
        return 1;
      case 'fase_3_despacho_aprobado':
      case 'despacho_aprobado':
      case 'pagado':
        return 2;
      case 'rechazado':
        return -1;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(expediente.estado);

  const handleAdvanceStageByVerificador = (nextState: ExpedienteEstado, nextLabel: string) => {
    Alert.alert(
      `Avanzar a: ${nextLabel}`,
      `¿Confirmas el cambio de estado de este expediente a "${nextLabel}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            await updateExpedienteEstado(
              expediente.id,
              nextState,
              `Fase actualizada a "${nextLabel}" por ${user?.name || 'Oficial DGA'}.`
            );
            Alert.alert('Estado Actualizado', `El expediente ahora está en fase: ${nextLabel}.`);
          },
        },
      ]
    );
  };

  const handleRejectByVerificador = () => {
    Alert.alert(
      'Rechazar Expediente',
      '¿Indicar inconformidad en el aforo documental o físico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            await updateExpedienteEstado(
              expediente.id,
              'rechazado',
              `Rechazado por inconsistencia documental por ${user?.name || 'Oficial DGA'}.`
            );
            Alert.alert('Rechazado', 'Se ha marcado el expediente como rechazado.');
          },
        },
      ]
    );
  };

  const handleAddDocument = async (nuevoDoc: Documento) => {
    setDocumentosLocales((prev) => [...prev, nuevoDoc]);
    await addDocumentoToExpediente(expediente.id, nuevoDoc);
    Alert.alert('Documento Adjuntado', `"${nuevoDoc.nombre}" se agregó al expediente.`);
  };

  const handleRemoveDocument = async (docId: string) => {
    setDocumentosLocales((prev) => prev.filter((d) => d.id !== docId));
    await removeDocumentoFromExpediente(expediente.id, docId);
  };

  return (
    <View style={styles.container}>
      {/* Header Superior */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>{expediente.numero}</Text>
          <Text style={styles.headerSub}>{expediente.declaracion}</Text>
        </View>
        <StatusBadge status={expediente.estado} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Línea de Tiempo / Stepper de Fases SIGA */}
        <Card variant="elevated" style={styles.stepperCard}>
          <View style={styles.stepperHeader}>
            <Activity size={16} color="#002D62" />
            <Text style={styles.stepperTitle}>Flujo de Despacho e Inspección SIGA</Text>
          </View>

          <View style={styles.stepperRow}>
            {SIGA_STAGES.map((stage, idx) => {
              const isCompleted = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;
              const isPending = currentStageIndex < idx;

              return (
                <React.Fragment key={stage.key}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        isCompleted && styles.stepCircleCompleted,
                        isCurrent && styles.stepCircleCurrent,
                        isPending && styles.stepCirclePending,
                        currentStageIndex === -1 && styles.stepCircleRejected,
                      ]}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={14} color="#FFFFFF" />
                      ) : (
                        <Text
                          style={[
                            styles.stepNumber,
                            isCurrent && styles.stepNumberCurrent,
                            isPending && styles.stepNumberPending,
                          ]}
                        >
                          {idx + 1}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabelText,
                        isCurrent && styles.stepLabelTextCurrent,
                        isCompleted && styles.stepLabelTextCompleted,
                      ]}
                      numberOfLines={2}
                    >
                      {stage.shortLabel}
                    </Text>
                  </View>
                  {idx < SIGA_STAGES.length - 1 && (
                    <View
                      style={[
                        styles.stepConnector,
                        isCompleted && styles.stepConnectorCompleted,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </Card>

        {/* Módulo Oficial SIGA: Resultado de Inspección */}
        <Card variant="elevated" style={[styles.sectionCard, styles.sigaInspectionCard]}>
          <View style={styles.sigaHeaderRow}>
            <View style={styles.sigaHeaderLeft}>
              <ShieldCheck size={16} color="#002D62" />
              <Text style={styles.sigaTitle}>Inspección y Despacho SIGA</Text>
            </View>
            <View style={styles.channelBadge}>
              <Text style={styles.channelBadgeText}>{expediente.canalControl || 'Pantalla de Inspección'}</Text>
            </View>
          </View>

          <View style={styles.sigaCodeBox}>
            <View style={styles.sigaCodeItem}>
              <Text style={styles.sigaLabel}>No. de Declaración</Text>
              <Text style={styles.sigaValueBig}>{expediente.declaracion}</Text>
            </View>
            {expediente.noResultadoInspeccion && (
              <View style={[styles.sigaCodeItem, { borderLeftWidth: 1, borderLeftColor: '#E2E8F0', paddingLeft: 10 }]}>
                <Text style={styles.sigaLabel}>No. Resultado Inspección</Text>
                <Text style={styles.sigaValueBold}>{expediente.noResultadoInspeccion}</Text>
              </View>
            )}
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Inspector Asignado</Text>
              <Text style={styles.inspectorValue}>
                {expediente.inspectorNombre
                  ? `${expediente.inspectorCodigo ? expediente.inspectorCodigo + ' - ' : ''}${expediente.inspectorNombre}`
                  : 'Pendiente de asignación'}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Fecha de Inspección</Text>
              <Text style={styles.fieldValue}>
                {expediente.fechaInspeccion || 'Por programar'}
              </Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Administración Aduanera</Text>
              <Text style={styles.fieldValue}>
                {expediente.administracion || '10030 - ADM. HAINA ORIENTAL'}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Depósito de Destino</Text>
              <Text style={styles.fieldValue}>
                {expediente.depositoDestino || 'TERMINALES HAINA S.A.'}
              </Text>
            </View>
          </View>
        </Card>

        {/* 1. Información General */}
        <Card variant="default" style={styles.sectionCard}>
          <View style={styles.cardSectionHeader}>
            <Building size={16} color={COLORS.primaryDark} />
            <Text style={styles.sectionTitle}>1. Información General</Text>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Importador</Text>
              <Text style={styles.fieldValue}>{expediente.importadorNombre}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Consignatario</Text>
              <Text style={styles.fieldValue}>{expediente.consignatario}</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Agencia Aduanal</Text>
              <Text style={styles.fieldValue}>{expediente.agencia}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Fecha de Registro</Text>
              <Text style={styles.fieldValue}>
                {new Date(expediente.fechaCreacion).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* 2. Detalles de Mercancía */}
        <Card variant="default" style={styles.sectionCard}>
          <View style={styles.cardSectionHeader}>
            <Package size={16} color={COLORS.primaryDark} />
            <Text style={styles.sectionTitle}>2. Detalles de la Mercancía</Text>
          </View>

          <Text style={styles.fieldLabel}>Descripción de Carga</Text>
          <Text style={styles.mercanciaDesc}>{expediente.mercancia}</Text>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Peso Bruto</Text>
              <Text style={styles.fieldValue}>{expediente.peso.toLocaleString()} kg</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Valor FOB</Text>
              <Text style={styles.fieldValue}>USD ${expediente.valorFOB.toLocaleString()}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>Valor CIF</Text>
              <Text style={[styles.fieldValue, { color: COLORS.primaryDark, fontWeight: '800' }]}>
                USD ${expediente.valorCIF.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* 3. Liquidación de Gravámenes e Impuestos */}
        <Card variant="subtle" style={styles.sectionCard}>
          <View style={styles.cardSectionHeader}>
            <DollarSign size={16} color={COLORS.primaryDark} />
            <Text style={styles.sectionTitle}>3. Liquidación de Impuestos DGA</Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Arancel Aduanero (Gravamen)</Text>
            <Text style={styles.taxValue}>USD ${expediente.impuestos.arancel.toLocaleString()}</Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>ITBIS Aduanal (18%)</Text>
            <Text style={styles.taxValue}>USD ${expediente.impuestos.itbis.toLocaleString()}</Text>
          </View>

          {expediente.impuestos.selectivo > 0 && (
            <View style={styles.taxRow}>
              <Text style={styles.taxLabel}>Impuesto Selectivo al Consumo</Text>
              <Text style={styles.taxValue}>
                USD ${expediente.impuestos.selectivo.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.taxDivider} />

          <View style={styles.taxTotalRow}>
            <Text style={styles.taxTotalLabel}>Total Tributos a Liquidar</Text>
            <Text style={styles.taxTotalValue}>
              USD ${expediente.impuestos.total.toLocaleString()}
            </Text>
          </View>
        </Card>

        {/* 4. IGEA (Entrada Aduanera) */}
        {igea && (
          <Card variant="default" style={styles.sectionCard}>
            <View style={styles.cardSectionHeader}>
              <Ship size={16} color={COLORS.primaryDark} />
              <Text style={styles.sectionTitle}>4. IGEA - Entrada Aduanera</Text>
              <StatusBadge status={igea.estado} size="small" style={{ marginLeft: 'auto' }} />
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>No. IGEA</Text>
                <Text style={styles.fieldValue}>{igea.numero}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Manifiesto</Text>
                <Text style={styles.fieldValue}>{igea.manifiesto}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* 5. IGRA (Retiro Aduanero) */}
        {igra && (
          <Card variant="default" style={styles.sectionCard}>
            <View style={styles.cardSectionHeader}>
              <Truck size={16} color={COLORS.primaryDark} />
              <Text style={styles.sectionTitle}>5. IGRA - Retiro y Pase de Salida</Text>
              <StatusBadge status={igra.estado} size="small" style={{ marginLeft: 'auto' }} />
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Resolución de Despacho</Text>
                <Text style={styles.fieldValue}>
                  {igra.estado === 'aprobado'
                    ? `Autorizado (${new Date(igra.fechaDespacho || '').toLocaleDateString()})`
                    : 'Pendiente de liquidación y aforo'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* 6. Estado de Carga */}
        {carga && (
          <Card variant="default" style={styles.sectionCard}>
            <View style={styles.cardSectionHeader}>
              <Package size={16} color={COLORS.primaryDark} />
              <Text style={styles.sectionTitle}>6. Trazabilidad de Carga</Text>
              <StatusBadge status={carga.estado} size="small" style={{ marginLeft: 'auto' }} />
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Bill of Lading (B/L)</Text>
                <Text style={styles.fieldValue}>{carga.bl}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>Contenedor</Text>
                <Text style={styles.fieldValue}>{carga.codigoInterno}</Text>
              </View>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 6 }]}>Ubicación Actual</Text>
            <Text style={styles.fieldValue}>{carga.ubicacion}</Text>
          </Card>
        )}

        {/* 7. Documentos Adjuntos */}
        <Card variant="default" style={styles.sectionCard}>
          <View style={styles.cardSectionHeader}>
            <FileText size={16} color={COLORS.primaryDark} />
            <Text style={styles.sectionTitle}>7. Documentación Adjunta</Text>
          </View>

          <FilePreview
            documentos={documentosLocales}
            onRemove={isImportador ? handleRemoveDocument : undefined}
            readOnly={!isImportador}
          />

          {isImportador && (
            <FileUpload
              onFileSelected={handleAddDocument}
              uploadedBy={user?.name || 'Importador'}
            />
          )}
        </Card>

        {/* Observaciones y Dictamen */}
        {expediente.observaciones && expediente.observaciones.length > 0 && (
          <Card variant="subtle" style={styles.sectionCard}>
            <Text style={styles.obsHeaderTitle}>Observaciones y Dictamen Aduanal</Text>
            {expediente.observaciones.map((obs, idx) => (
              <Text key={idx} style={styles.obsItemText}>
                • {obs}
              </Text>
            ))}
          </Card>
        )}

        {/* Barra de Acciones según Rol */}
        <View style={styles.actionSection}>
          {isVerificador && currentStageIndex !== 2 && expediente.estado !== 'rechazado' && (
            <View style={styles.verificadorActionsCol}>
              {currentStageIndex === 0 && (
                <Button
                  title="Aprobar por Verificador"
                  icon={CheckCircle2}
                  variant="primary"
                  size="large"
                  onPress={() => handleAdvanceStageByVerificador('fase_2_aprobado_verificador', 'Aprobado por el verificador')}
                  style={{ marginBottom: 8 }}
                />
              )}
              {currentStageIndex === 1 && (
                <Button
                  title="Aprobar Despacho"
                  icon={ShieldCheck}
                  variant="success"
                  size="large"
                  onPress={() => handleAdvanceStageByVerificador('fase_3_despacho_aprobado', 'Despacho aprobado')}
                  style={{ marginBottom: 8 }}
                />
              )}
              <Button
                title="Rechazar Expediente"
                icon={XCircle}
                variant="danger"
                size="large"
                onPress={handleRejectByVerificador}
              />
            </View>
          )}

          {isImportador && currentStageIndex !== 2 && (
            <Button
              title="Ir a Pagar Impuestos"
              icon={CreditCard}
              variant="primary"
              size="large"
              onPress={() => router.push('/(tabs)/pagos')}
              fullWidth
            />
          )}
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  stepperCard: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  stepperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  stepperTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#002D62',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 62,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
  },
  stepCircleCurrent: {
    backgroundColor: '#002B66',
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  stepCirclePending: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepCircleRejected: {
    backgroundColor: '#EF4444',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepNumberCurrent: {
    color: '#FFFFFF',
  },
  stepNumberPending: {
    color: '#94A3B8',
  },
  stepLabelText: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 12,
  },
  stepLabelTextCurrent: {
    color: '#002B66',
    fontWeight: '800',
  },
  stepLabelTextCompleted: {
    color: '#059669',
    fontWeight: '700',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 18,
    marginHorizontal: -4,
  },
  stepConnectorCompleted: {
    backgroundColor: '#10B981',
  },
  verificadorActionsCol: {
    width: '100%',
  },
  sectionCard: {
    padding: 14,
    marginVertical: 0,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  gridCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  mercanciaDesc: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 10,
    fontWeight: '500',
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  taxLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  taxValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  taxDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  taxTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taxTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  taxTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  obsHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  obsItemText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  actionSection: {
    marginTop: 8,
  },
  verificadorBtnRow: {
    flexDirection: 'row',
  },
  sigaInspectionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#002D62',
    backgroundColor: '#FFFFFF',
  },
  sigaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sigaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sigaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#002D62',
  },
  channelBadge: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  channelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  sigaCodeBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sigaCodeItem: {
    flex: 1,
  },
  sigaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  sigaValueBig: {
    fontSize: 13,
    fontWeight: '900',
    color: '#002D62',
    marginTop: 2,
  },
  sigaValueBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  inspectorValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002D62',
    marginTop: 2,
  },
});
