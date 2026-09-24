import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  DollarSign,
  Calendar,
  X,
  ShieldCheck,
  Receipt,
  ArrowUpRight,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { Pago, PagoEstado } from '@/types';

export default function PagosScreen() {
  const { user, isImportador, isVerificador } = useAuth();
  const { pagos, expedientes, realizarPago, confirmarPago } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | PagoEstado>('todos');
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [montoAbono, setMontoAbono] = useState('');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('Transferencia Banreservas ACH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [lastPagoDetail, setLastPagoDetail] = useState('');

  // Totales
  const totalFacturado = pagos.reduce((acc, p) => acc + p.montoTotal, 0);
  const totalRecaudado = pagos.reduce((acc, p) => acc + p.monto, 0);
  const totalPendiente = totalFacturado - totalRecaudado;

  // Filtrado
  const filteredPagos = pagos.filter((pago) => {
    if (activeTab !== 'todos' && pago.estado !== activeTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numExp = (pago.numeroExpediente || '').toLowerCase();
      return numExp.includes(q) || pago.id.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenPayModal = (pago: Pago) => {
    setSelectedPago(pago);
    const pendiente = pago.montoTotal - pago.monto;
    setMontoAbono(pendiente.toString());
    setPaymentModalVisible(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedPago) return;
    const monto = parseFloat(montoAbono);
    const pendiente = selectedPago.montoTotal - selectedPago.monto;

    if (isNaN(monto) || monto <= 0) {
      Alert.alert('Monto Inválido', 'Por favor ingresa un monto mayor a 0.');
      return;
    }

    if (monto > pendiente) {
      Alert.alert('Monto Excedido', `El monto a pagar no puede superar el saldo pendiente ($${pendiente}).`);
      return;
    }

    try {
      setIsProcessing(true);
      await realizarPago(selectedPago.id, monto, metodoSeleccionado);
      setPaymentModalVisible(false);
      setLastPagoDetail(`Expediente: ${selectedPago.numeroExpediente || selectedPago.expedienteId} · USD $${monto.toLocaleString()}`);
      setSuccessVisible(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo procesar la transacción.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmByVerificador = async (pago: Pago) => {
    Alert.alert(
      'Validar Pago Aduanal',
      `¿Deseas confirmar la liquidación total de los gravámenes para el expediente ${pago.numeroExpediente}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar y Liberar',
          style: 'default',
          onPress: async () => {
            await confirmarPago(pago.id);
            Alert.alert('Confirmado', 'El pago ha sido validado satisfactoriamente.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Superior */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gestión de Pagos e Impuestos</Text>
          <Text style={styles.headerSubtitle}>Liquidación de Gravámenes e ITBIS DGA</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Métricas de Cobros */}
        <View style={styles.metricsContainer}>
          <Card variant="subtle" style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Pendiente</Text>
            <Text style={[styles.metricValue, { color: '#C62828' }]}>
              USD ${totalPendiente.toLocaleString()}
            </Text>
          </Card>

          <Card variant="subtle" style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Liquidado</Text>
            <Text style={[styles.metricValue, { color: COLORS.primaryDark }]}>
              USD ${totalRecaudado.toLocaleString()}
            </Text>
          </Card>
        </View>

        {/* Buscador */}
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por número de expediente..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Tabs de Filtro */}
        <View style={styles.tabsContainer}>
          {(['todos', 'pendiente', 'parcial', 'pagado'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab === 'todos'
                    ? 'Todos'
                    : tab === 'parcial'
                    ? 'Parciales'
                    : tab.charAt(0).toUpperCase() + tab.slice(1) + 's'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Lista de Pagos */}
        <View style={styles.pagosList}>
          {filteredPagos.length === 0 ? (
            <Card variant="subtle" style={styles.emptyCard}>
              <Receipt size={32} color={COLORS.neutral} />
              <Text style={styles.emptyTitle}>No hay pagos registrados</Text>
              <Text style={styles.emptySub}>No se encontraron registros con los filtros actuales.</Text>
            </Card>
          ) : (
            filteredPagos.map((pago) => {
              const pendiente = pago.montoTotal - pago.monto;
              const porcentaje = Math.round((pago.monto / pago.montoTotal) * 100);

              return (
                <Card key={pago.id} variant="elevated" style={styles.pagoCard}>
                  <View style={styles.pagoHeader}>
                    <View>
                      <Text style={styles.pagoExpNumber}>{pago.numeroExpediente || pago.expedienteId}</Text>
                      <Text style={styles.pagoSub}>Ref: {pago.id.toUpperCase()}</Text>
                    </View>
                    <StatusBadge status={pago.estado} />
                  </View>

                  {/* Barra de progreso de pago */}
                  <View style={styles.pagoProgressContainer}>
                    <View style={styles.pagoProgressRow}>
                      <Text style={styles.progressSubText}>Cubierto: {porcentaje}%</Text>
                      <Text style={styles.progressSubText}>
                        Pendiente: USD ${pendiente.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${porcentaje}%`,
                            backgroundColor:
                              pago.estado === 'pagado'
                                ? COLORS.primaryDark
                                : pago.estado === 'parcial'
                                ? '#FFA000'
                                : '#EF5350',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.pagoDetailsGrid}>
                    <View>
                      <Text style={styles.detailTitle}>Monto Total</Text>
                      <Text style={styles.detailTotal}>USD ${pago.montoTotal.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text style={styles.detailTitle}>Monto Pagado</Text>
                      <Text style={styles.detailPaid}>USD ${pago.monto.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text style={styles.detailTitle}>Vence</Text>
                      <Text style={styles.detailDate}>
                        {new Date(pago.fechaVencimiento).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {pago.metodoPago && (
                    <View style={styles.metodoBox}>
                      <Receipt size={14} color={COLORS.primaryDark} />
                      <Text style={styles.metodoText}>{pago.metodoPago}</Text>
                    </View>
                  )}

                  <View style={styles.cardActionRow}>
                    {isImportador && pago.estado !== 'pagado' && (
                      <Button
                        title="Pagar Ahora"
                        icon={DollarSign}
                        size="small"
                        variant="primary"
                        onPress={() => handleOpenPayModal(pago)}
                        style={{ flex: 1 }}
                      />
                    )}

                    {isVerificador && pago.estado !== 'pagado' && (
                      <Button
                        title="Validar Pago DGA"
                        icon={CheckCircle2}
                        size="small"
                        variant="success"
                        onPress={() => handleConfirmByVerificador(pago)}
                        style={{ flex: 1 }}
                      />
                    )}

                    {pago.estado === 'pagado' && (
                      <View style={styles.receiptPill}>
                        <CheckCircle2 size={15} color={COLORS.primaryDark} />
                        <Text style={styles.receiptText}>Comprobante Fiscal Emitido</Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal para Realizar Pago */}
      <Modal visible={paymentModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Liquidación de Impuestos</Text>
                <Text style={styles.modalSub}>{selectedPago?.numeroExpediente}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPaymentModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <View style={styles.debtSummaryBox}>
                <Text style={styles.debtTitle}>Saldo Pendiente a Liquidar</Text>
                <Text style={styles.debtAmount}>
                  USD $
                  {selectedPago
                    ? (selectedPago.montoTotal - selectedPago.monto).toLocaleString()
                    : '0'}
                </Text>
              </View>

              <Text style={styles.modalInputLabel}>Monto a Pagar (USD)</Text>
              <TextInput
                style={styles.modalInput}
                value={montoAbono}
                onChangeText={setMontoAbono}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />

              <Text style={styles.modalInputLabel}>Método de Pago Autorizado</Text>
              {[
                'Transferencia Banreservas ACH',
                'Banco BHD Débito Empresarial',
                'Tarjeta de Crédito Corporativa (Visa/Mastercard)',
                'Cheque Certificado Aduanal',
              ].map((metodo) => {
                const isSelected = metodoSeleccionado === metodo;
                return (
                  <TouchableOpacity
                    key={metodo}
                    onPress={() => setMetodoSeleccionado(metodo)}
                    style={[styles.metodoOption, isSelected && styles.metodoOptionActive]}
                  >
                    <Building
                      size={16}
                      color={isSelected ? COLORS.primaryDark : COLORS.neutralDark}
                    />
                    <Text
                      style={[
                        styles.metodoOptionText,
                        isSelected && styles.metodoOptionTextActive,
                      ]}
                    >
                      {metodo}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.securityNote}>
                <ShieldCheck size={16} color={COLORS.primaryDark} />
                <Text style={styles.securityNoteText}>
                  Transacción protegida mediante firma digital y pasarela oficial DGA.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancelar"
                variant="outline"
                size="medium"
                onPress={() => setPaymentModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Procesar Pago"
                variant="primary"
                size="medium"
                loading={isProcessing}
                onPress={handleProcessPayment}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Animation Modal */}
      <SuccessModal
        visible={successVisible}
        type="pago"
        detail={lastPagoDetail}
        onClose={() => setSuccessVisible(false)}
        actionLabel="Entendido"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
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
    paddingBottom: 40,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    marginVertical: 0,
    padding: 14,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.white,
  },
  pagosList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  pagoCard: {
    padding: 16,
    marginVertical: 0,
  },
  pagoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pagoExpNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  pagoSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  pagoProgressContainer: {
    marginBottom: 12,
    gap: 4,
  },
  pagoProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  pagoDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  detailTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  detailPaid: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  detailDate: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metodoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  metodoText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  cardActionRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  receiptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  receiptText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  modalBody: {
    marginBottom: 16,
  },
  debtSummaryBox: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  debtTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B76E00',
  },
  debtAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E65100',
    marginTop: 4,
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1.2,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metodoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  metodoOptionActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: '#F1F8E9',
  },
  metodoOptionText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  metodoOptionTextActive: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  securityNoteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
