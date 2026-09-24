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
  Dimensions,
} from 'react-native';
import {
  CreditCard,
  Plus,
  Eye,
  EyeOff,
  ChevronRight,
  Trash2,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  X,
  MoreVertical,
  Star,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { PaymentCard, Transaction, CardType, CardStatus } from '@/types';

const { width } = Dimensions.get('window');

export default function BilleteraScreen() {
  const { user } = useAuth();
  
  // Mock data - en producción esto vendría del backend
  const [cards, setCards] = useState<PaymentCard[]>([
    {
      id: '1',
      type: 'visa',
      lastFour: '4242',
      holderName: user?.name || 'Usuario Demo',
      expiryMonth: 12,
      expiryYear: 2027,
      status: 'active',
      isDefault: true,
      balance: 15000,
      limit: 50000,
      bankName: 'Banreservas',
      color: '#1E3A8A',
    },
    {
      id: '2',
      type: 'mastercard',
      lastFour: '8888',
      holderName: user?.name || 'Usuario Demo',
      expiryMonth: 8,
      expiryYear: 2026,
      status: 'active',
      isDefault: false,
      balance: 8500,
      limit: 30000,
      bankName: 'BHD León',
      color: '#DC2626',
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      cardId: '1',
      amount: 2500,
      currency: 'USD',
      type: 'debit',
      description: 'Pago de impuestos aduanales',
      merchant: 'DGA',
      date: new Date().toISOString(),
      status: 'completed',
      category: 'aduana',
    },
    {
      id: '2',
      cardId: '1',
      amount: 5000,
      currency: 'USD',
      type: 'credit',
      description: 'Depósito de cliente',
      merchant: 'Transferencia',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      category: 'ingreso',
    },
    {
      id: '3',
      cardId: '2',
      amount: 1200,
      currency: 'USD',
      type: 'debit',
      description: 'Tarifas de almacenaje',
      merchant: 'Terminales Haina',
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed',
      category: 'almacenaje',
    },
  ]);

  const [showBalance, setShowBalance] = useState(true);
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successDetail, setSuccessDetail] = useState('');

  // New card form state
  const [newCardType, setNewCardType] = useState<CardType>('visa');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState(user?.name || '');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCVV, setNewCardCVV] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const totalBalance = cards.reduce((acc, card) => acc + (card.balance || 0), 0);
  const totalLimit = cards.reduce((acc, card) => acc + (card.limit || 0), 0);

  const getCardIcon = (type: CardType) => {
    switch (type) {
      case 'visa':
        return 'VISA';
      case 'mastercard':
        return 'MC';
      case 'amex':
        return 'AMEX';
      case 'discover':
        return 'DISC';
      case 'debit':
        return 'DÉBITO';
      default:
        return 'CARD';
    }
  };

  const getCardGradient = (color: string) => {
    return { backgroundColor: color };
  };

  const handleSetDefaultCard = (cardId: string) => {
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
    Alert.alert('Tarjeta Actualizada', 'Esta tarjeta ahora es tu método de pago predeterminado.');
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      'Eliminar Tarjeta',
      '¿Estás seguro de que deseas eliminar esta tarjeta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setCards(cards.filter(card => card.id !== cardId));
            Alert.alert('Tarjeta Eliminada', 'La tarjeta ha sido eliminada exitosamente.');
          },
        },
      ]
    );
  };

  const handleAddCard = () => {
    // Validación básica
    if (newCardNumber.length < 16) {
      Alert.alert('Error', 'Por favor ingresa un número de tarjeta válido.');
      return;
    }
    if (newCardHolder.trim() === '') {
      Alert.alert('Error', 'Por favor ingresa el nombre del titular.');
      return;
    }
    if (newCardExpiry.length < 5) {
      Alert.alert('Error', 'Por favor ingresa la fecha de vencimiento (MM/AA).');
      return;
    }
    if (newCardCVV.length < 3) {
      Alert.alert('Error', 'Por favor ingresa el CVV.');
      return;
    }

    setIsAddingCard(true);
    
    // Simular agregar tarjeta
    setTimeout(() => {
      const newCard: PaymentCard = {
        id: Date.now().toString(),
        type: newCardType,
        lastFour: newCardNumber.slice(-4),
        holderName: newCardHolder,
        expiryMonth: parseInt(newCardExpiry.slice(0, 2)),
        expiryYear: parseInt('20' + newCardExpiry.slice(3, 5)),
        status: 'active',
        isDefault: cards.length === 0,
        bankName: 'Nuevo Banco',
        color: newCardType === 'visa' ? '#1E3A8A' : newCardType === 'mastercard' ? '#DC2626' : '#059669',
      };

      setCards([...cards, newCard]);
      setAddCardModalVisible(false);
      setSuccessDetail('Nueva tarjeta de crédito/débito agregada exitosamente');
      setSuccessVisible(true);
      
      // Reset form
      setNewCardNumber('');
      setNewCardHolder(user?.name || '');
      setNewCardExpiry('');
      setNewCardCVV('');
      setIsAddingCard(false);
    }, 1500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Billetera</Text>
          <Text style={styles.headerSubtitle}>Gestiona tus métodos de pago</Text>
        </View>
        <TouchableOpacity
          style={styles.balanceToggle}
          onPress={() => setShowBalance(!showBalance)}
        >
          {showBalance ? (
            <EyeOff size={20} color={COLORS.textMuted} />
          ) : (
            <Eye size={20} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Balance Overview */}
        <View style={styles.balanceSection}>
          <Card variant="elevated" style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Balance Total Disponible</Text>
              <View style={styles.balanceIcon}>
                <CreditCard size={20} color={COLORS.primaryDark} />
              </View>
            </View>
            <Text style={styles.balanceAmount}>
              {showBalance ? `USD $${totalBalance.toLocaleString()}` : '****'}
            </Text>
            <View style={styles.balanceDetails}>
              <View style={styles.balanceDetail}>
                <Text style={styles.balanceDetailLabel}>Límite Total</Text>
                <Text style={styles.balanceDetailValue}>
                  {showBalance ? `USD $${totalLimit.toLocaleString()}` : '****'}
                </Text>
              </View>
              <View style={styles.balanceDetail}>
                <Text style={styles.balanceDetailLabel}>Utilizado</Text>
                <Text style={styles.balanceDetailValue}>
                  {showBalance ? `USD $${(totalLimit - totalBalance).toLocaleString()}` : '****'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Métodos de Pago</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddCardModalVisible(true)}
            >
              <Plus size={18} color={COLORS.primaryDark} />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScroll}
          >
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => setSelectedCard(card)}
                activeOpacity={0.9}
              >
                <View style={[styles.cardPreview, getCardGradient(card.color || '#1E3A8A')]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardBrand}>{getCardIcon(card.type)}</Text>
                    {card.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Star size={12} color="#FFF" fill="#FFF" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {card.lastFour}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.cardHolderLabel}>Titular</Text>
                      <Text style={styles.cardHolderName} numberOfLines={1}>
                        {card.holderName.toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.cardExpiryLabel}>Expira</Text>
                      <Text style={styles.cardExpiry}>
                        {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
                      </Text>
                    </View>
                  </View>
                  {card.bankName && (
                    <Text style={styles.bankName}>{card.bankName}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Card Details */}
        {selectedCard && (
          <View style={styles.section}>
            <Card variant="elevated" style={styles.cardDetailCard}>
              <View style={styles.cardDetailHeader}>
                <View>
                  <Text style={styles.cardDetailTitle}>Detalles de Tarjeta</Text>
                  <Text style={styles.cardDetailSub}>
                    {getCardIcon(selectedCard.type)} •••• {selectedCard.lastFour}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCard(null)}>
                  <X size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardDetailStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Balance</Text>
                  <Text style={styles.statValue}>
                    USD ${(selectedCard.balance || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Límite</Text>
                  <Text style={styles.statValue}>
                    USD ${(selectedCard.limit || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Disponible</Text>
                  <Text style={[styles.statValue, { color: COLORS.primaryDark }]}>
                    USD ${((selectedCard.limit || 0) - (selectedCard.balance || 0)).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDetailActions}>
                {!selectedCard.isDefault && (
                  <Button
                    title="Establecer como Predeterminada"
                    icon={Star}
                    size="small"
                    variant="outline"
                    onPress={() => handleSetDefaultCard(selectedCard.id)}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                )}
                <Button
                  title="Eliminar"
                  icon={Trash2}
                  size="small"
                  variant="outline"
                  onPress={() => handleDeleteCard(selectedCard.id)}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </Card>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver todas</Text>
              <ChevronRight size={16} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {transactions.map((transaction) => {
              const card = cards.find(c => c.id === transaction.cardId);
              return (
                <Card key={transaction.id} variant="subtle" style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: transaction.type === 'credit' ? '#E8F5E9' : '#FFEBEE' }
                    ]}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownLeft size={18} color={COLORS.primaryDark} />
                      ) : (
                        <ArrowUpRight size={18} color='#C62828' />
                      )}
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDesc}>{transaction.description}</Text>
                      <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.type === 'credit' ? styles.amountCredit : styles.amountDebit
                    ]}>
                      {transaction.type === 'credit' ? '+' : '-'}
                      USD ${transaction.amount.toLocaleString()}
                    </Text>
                    <View style={[
                      styles.transactionStatus,
                      transaction.status === 'completed' && styles.transactionStatusCompleted
                    ]}>
                      {transaction.status === 'completed' && (
                        <CheckCircle2 size={12} color={COLORS.primaryDark} />
                      )}
                      {transaction.status === 'pending' && (
                        <Clock size={12} color={COLORS.warning} />
                      )}
                      <Text style={[
                        styles.transactionStatusText,
                        transaction.status === 'completed' && styles.statusTextCompleted
                      ]}>
                        {transaction.status === 'completed' ? 'Completado' : 
                         transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Security Info */}
        <Card variant="subtle" style={styles.securityCard}>
          <View style={styles.securityContent}>
            <ShieldCheck size={24} color={COLORS.primaryDark} />
            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>Pagos Seguros</Text>
              <Text style={styles.securitySub}>
                Todas las transacciones están protegidas con encriptación de extremo a extremo
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={addCardModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nueva Tarjeta</Text>
              <TouchableOpacity onPress={() => setAddCardModalVisible(false)}>
                <X size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalInputLabel}>Tipo de Tarjeta</Text>
              <View style={styles.cardTypeSelector}>
                {(['visa', 'mastercard', 'amex', 'debit'] as CardType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setNewCardType(type)}
                    style={[
                      styles.cardTypeOption,
                      newCardType === type && styles.cardTypeOptionActive
                    ]}
                  >
                    <Text style={[
                      styles.cardTypeText,
                      newCardType === type && styles.cardTypeTextActive
                    ]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalInputLabel}>Número de Tarjeta</Text>
              <TextInput
                style={styles.modalInput}
                value={formatCardNumber(newCardNumber)}
                onChangeText={(text) => setNewCardNumber(text.replace(/\s/g, ''))}
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
                maxLength={19}
              />

              <Text style={styles.modalInputLabel}>Nombre del Titular</Text>
              <TextInput
                style={styles.modalInput}
                value={newCardHolder}
                onChangeText={setNewCardHolder}
                placeholder="Como aparece en la tarjeta"
                autoCapitalize="characters"
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.modalInputLabel}>Vencimiento</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={formatExpiry(newCardExpiry)}
                    onChangeText={setNewCardExpiry}
                    placeholder="MM/AA"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalInputLabel}>CVV</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newCardCVV}
                    onChangeText={setNewCardCVV}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.securityNote}>
                <ShieldCheck size={16} color={COLORS.primaryDark} />
                <Text style={styles.securityNoteText}>
                  Tu información está protegida con encriptación SSL de 256 bits
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancelar"
                variant="outline"
                size="medium"
                onPress={() => setAddCardModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Agregar Tarjeta"
                variant="primary"
                size="medium"
                loading={isAddingCard}
                onPress={handleAddCard}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={successVisible}
        type="pago"
        detail={successDetail}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  balanceToggle: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  balanceSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  balanceCard: {
    padding: 20,
    marginVertical: 0,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  balanceIcon: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 10,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  balanceDetail: {
    flex: 1,
  },
  balanceDetailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  balanceDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  cardsScroll: {
    gap: 12,
    paddingRight: 16,
  },
  cardPreview: {
    width: width - 48,
    height: 180,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  defaultBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 4,
    borderRadius: 8,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 2,
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHolderLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  cardHolderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 2,
  },
  cardExpiryLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 2,
  },
  bankName: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: 4,
  },
  cardDetailCard: {
    padding: 16,
    marginVertical: 0,
  },
  cardDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardDetailTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardDetailSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardDetailStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  cardDetailActions: {
    flexDirection: 'row',
  },
  transactionsList: {
    gap: 8,
  },
  transactionCard: {
    padding: 14,
    marginVertical: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  transactionMerchant: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  amountCredit: {
    color: COLORS.primaryDark,
  },
  amountDebit: {
    color: '#C62828',
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionStatusCompleted: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  statusTextCompleted: {
    color: COLORS.primaryDark,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  securityCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  securitySub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalBody: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1.2,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardTypeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  cardTypeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cardTypeOptionActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  cardTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  cardTypeTextActive: {
    color: COLORS.white,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  securityNoteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
