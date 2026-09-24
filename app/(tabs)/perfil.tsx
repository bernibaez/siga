import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Modal,
  Animated,
  Easing,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Shield,
  Phone,
  Mail,
  Building,
  Bell,
  Fingerprint,
  Globe,
  HelpCircle,
  LogOut,
  Edit3,
  Sparkles,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Wallet,
  CreditCard,
  Plus,
  Trash2,
  Check,
  X,
  Lock,
  Wifi,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProfileEditModal } from '@/components/ui/ProfileEditModal';
import { UserRole } from '@/types';

export default function PerfilScreen() {
  const { user, logout, updateProfile, switchRole, isImportador } = useAuth();
  const { resetToDefaults } = useData();
  const router = useRouter();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  // ── Wallet state ─────────────────────────────────────────────────────────
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardNetwork, setNewCardNetwork] = useState<'visa' | 'mastercard' | 'amex'>('visa');

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm-1',
      type: 'visa' as const,
      last4: '4821',
      holder: user?.name?.split(' ')[0] ?? 'Titular',
      expiry: '08/27',
      bank: 'Banco BHD León',
      gradient: ['#1B5E20', '#2E7D32'] as [string, string],
      isDefault: true,
    },
    {
      id: 'pm-2',
      type: 'mastercard' as const,
      last4: '3370',
      holder: user?.name?.split(' ')[0] ?? 'Titular',
      expiry: '03/26',
      bank: 'Banco Popular Dominicano',
      gradient: ['#1565C0', '#0D3B66'] as [string, string],
      isDefault: false,
    },
  ]);

  const handleAddCard = () => {
    const digits = newCardNumber.replace(/\s/g, '');
    if (digits.length < 14 || !newCardHolder.trim() || newCardExpiry.length < 5) {
      Alert.alert('Datos incompletos', 'Por favor completa todos los campos correctamente.');
      return;
    }
    const gradients: Record<string, [string, string]> = {
      visa: ['#1B5E20', '#2E7D32'],
      mastercard: ['#B71C1C', '#6D1F1F'],
      amex: ['#002B66', '#1565C0'],
    };
    setPaymentMethods((prev) => [
      ...prev,
      {
        id: `pm-${Date.now()}`,
        type: newCardNetwork,
        last4: digits.slice(-4),
        holder: newCardHolder.trim().split(' ')[0],
        expiry: newCardExpiry,
        bank: 'Tarjeta Registrada',
        gradient: gradients[newCardNetwork],
        isDefault: false,
      },
    ]);
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setAddCardVisible(false);
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert('Eliminar Tarjeta', '¿Deseas eliminar este método de pago?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
          setActiveCardIndex(0);
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  const formatCardInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiryInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  const handleSwitchRole = async (targetRole: UserRole) => {
    await switchRole(targetRole);
    Alert.alert(
      'Rol Cambiado',
      `Has cambiado al modo ${targetRole === 'importador' ? 'Importador' : 'Oficial Verificador DGA'}.`
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Restablecer Datos de Demostración',
      '¿Deseas restaurar los expedientes, pagos y notificaciones de prueba a su estado original?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            await resetToDefaults();
            Alert.alert('Restablecido', 'Los datos iniciales han sido recargados.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity
          onPress={() => setEditModalVisible(true)}
          style={styles.editHeaderBtn}
          activeOpacity={0.7}
        >
          <Edit3 size={18} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner de Usuario */}
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.accentNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBanner}
        >
          <View style={styles.avatarCircle}>
            <User size={36} color={COLORS.white} />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.rolePill}>
            <ShieldCheck size={12} color={COLORS.white} />
            <Text style={styles.rolePillText}>
              {isImportador ? 'Importador OEA Homologado' : 'Oficial de Aforo DGA'}
            </Text>
          </View>
          <Text style={styles.userCompany}>{user?.compania}</Text>
        </LinearGradient>

        {/* Sección de Cambio Rápido de Rol (Para Demostración) */}
        <Card variant="subtle" style={styles.roleSwitchCard}>
          <View style={styles.roleSwitchHeader}>
            <Sparkles size={16} color={COLORS.primaryDark} />
            <Text style={styles.roleSwitchTitle}>Cambiar Perfil para Pruebas</Text>
          </View>
          <Text style={styles.roleSwitchSub}>
            Permite alternar entre la experiencia de Importador y Verificador en vivo.
          </Text>

          <View style={styles.roleButtonsRow}>
            <TouchableOpacity
              onPress={() => handleSwitchRole('importador')}
              style={[styles.roleBtn, isImportador && styles.roleBtnActive]}
            >
              <Text style={[styles.roleBtnText, isImportador && styles.roleBtnTextActive]}>
                Importador
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSwitchRole('verificador')}
              style={[styles.roleBtn, !isImportador && styles.roleBtnActive]}
            >
              <Text style={[styles.roleBtnText, !isImportador && styles.roleBtnTextActive]}>
                Verificador DGA
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Información de Identificación y Contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Datos de la Cuenta</Text>
          <Card variant="default" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Mail size={16} color={COLORS.primaryDark} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <Phone size={16} color={COLORS.primaryDark} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{user?.telefono}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <Building size={16} color={COLORS.primaryDark} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>RNC / Cédula</Text>
                <Text style={styles.infoValue}>{user?.cedula}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* ── Wallet & Métodos de Pago ──────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Wallet & Métodos de Pago</Text>
            <TouchableOpacity
              onPress={() => setAddCardVisible(true)}
              style={styles.addCardBtn}
              activeOpacity={0.75}
            >
              <Plus size={14} color={COLORS.white} />
              <Text style={styles.addCardBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {/* Card Carousel */}
          {paymentMethods.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardCarousel}
              snapToInterval={300 + 12}
              decelerationRate="fast"
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (300 + 12));
                setActiveCardIndex(Math.min(idx, paymentMethods.length - 1));
              }}
            >
              {paymentMethods.map((method, idx) => (
                <LinearGradient
                  key={method.id}
                  colors={method.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bankCard}
                >
                  {/* Card top row */}
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardBankLabel}>{method.bank}</Text>
                    <View style={styles.cardActions}>
                      {!method.isDefault && (
                        <TouchableOpacity
                          onPress={() => handleSetDefault(method.id)}
                          style={styles.cardActionBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Check size={13} color="rgba(255,255,255,0.85)" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteCard(method.id)}
                        style={styles.cardActionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Trash2 size={13} color="rgba(255,255,255,0.75)" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Chip + Contactless */}
                  <View style={styles.cardChipRow}>
                    {/* EMV Chip */}
                    <View style={styles.chipContainer}>
                      <View style={styles.chipLine} />
                      <View style={styles.chipCenter} />
                    </View>
                    <Wifi size={18} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: '90deg' }] }} />
                  </View>

                  {/* Card number */}
                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {method.last4}
                  </Text>

                  {/* Card bottom */}
                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.cardBottomLabel}>TITULAR</Text>
                      <Text style={styles.cardBottomValue}>{method.holder}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardBottomLabel}>VENCE</Text>
                      <Text style={styles.cardBottomValue}>{method.expiry}</Text>
                    </View>
                    {/* Network logo text */}
                    <View style={styles.networkBadge}>
                      {method.type === 'visa' && (
                        <Text style={styles.visaText}>VISA</Text>
                      )}
                      {method.type === 'mastercard' && (
                        <View style={styles.mastercardLogo}>
                          <View style={[styles.mcCircle, { backgroundColor: '#EB001B' }]} />
                          <View style={[styles.mcCircle, { backgroundColor: '#F79E1B', marginLeft: -10 }]} />
                        </View>
                      )}
                      {method.type === 'amex' && (
                        <Text style={styles.amexText}>AMEX</Text>
                      )}
                    </View>
                  </View>

                  {/* Default badge */}
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Lock size={9} color={COLORS.primaryDark} />
                      <Text style={styles.defaultBadgeText}>Predeterminada</Text>
                    </View>
                  )}
                </LinearGradient>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyWallet}>
              <Wallet size={32} color={COLORS.neutral} />
              <Text style={styles.emptyWalletText}>Sin métodos de pago</Text>
              <Text style={styles.emptyWalletSub}>Agrega una tarjeta para agilizar tus liquidaciones aduaneras.</Text>
            </View>
          )}

          {/* Card dots indicator */}
          {paymentMethods.length > 1 && (
            <View style={styles.dotsRow}>
              {paymentMethods.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activeCardIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Methods summary list */}
          <View style={styles.methodsSummaryCard}>
            <View style={styles.methodsSummaryHeader}>
              <Wallet size={14} color={COLORS.primaryDark} />
              <Text style={styles.methodsSummaryTitle}>Métodos Registrados</Text>
            </View>
            {paymentMethods.map((method, idx) => (
              <View key={method.id}>
                {idx > 0 && <View style={styles.infoDivider} />}
                <View style={styles.methodSummaryRow}>
                  <LinearGradient
                    colors={method.gradient}
                    style={styles.methodIconGrad}
                  >
                    <CreditCard size={13} color="white" />
                  </LinearGradient>
                  <View style={styles.methodSummaryCol}>
                    <Text style={styles.methodSummaryName}>{method.bank}</Text>
                    <Text style={styles.methodSummaryNumber}>•••• {method.last4} · {method.type.toUpperCase()}</Text>
                  </View>
                  {method.isDefault && (
                    <View style={styles.defaultTag}>
                      <Text style={styles.defaultTagText}>Default</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
            {paymentMethods.length === 0 && (
              <Text style={styles.noMethodsText}>No hay métodos registrados.</Text>
            )}
          </View>
        </View>

        {/* Preferencias de la Aplicación */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferencias</Text>
          <Card variant="default" style={styles.prefsCard}>
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Bell size={18} color={COLORS.textPrimary} />
                <Text style={styles.prefText}>Notificaciones Push</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E0E0E0', true: COLORS.primaryLight }}
                thumbColor={notificationsEnabled ? COLORS.primaryDark : '#FAFAFA'}
              />
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Fingerprint size={18} color={COLORS.textPrimary} />
                <Text style={styles.prefText}>Autenticación Biométrica</Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: '#E0E0E0', true: COLORS.primaryLight }}
                thumbColor={biometricsEnabled ? COLORS.primaryDark : '#FAFAFA'}
              />
            </View>

            <View style={styles.infoDivider} />

            <TouchableOpacity
              style={styles.prefRow}
              onPress={() => Alert.alert('Idioma', 'Español (República Dominicana)')}
            >
              <View style={styles.prefLeft}>
                <Globe size={18} color={COLORS.textPrimary} />
                <Text style={styles.prefText}>Idioma</Text>
              </View>
              <View style={styles.prefRightRow}>
                <Text style={styles.prefValueText}>Español (DO)</Text>
                <ChevronRight size={16} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Soporte y Mantenimiento */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Soporte DGA</Text>
          <Card variant="default" style={styles.prefsCard}>
            <TouchableOpacity
              style={styles.prefRow}
              onPress={() =>
                Alert.alert(
                  'Mesa de Ayuda SIGA',
                  'Teléfono DGA: (809) 547-7070\nEmail: soporte.siga@aduanas.gob.do\nHorario: Lun-Vie 8:00 AM - 5:00 PM'
                )
              }
            >
              <View style={styles.prefLeft}>
                <HelpCircle size={18} color={COLORS.textPrimary} />
                <Text style={styles.prefText}>Mesa de Ayuda y Contacto</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.infoDivider} />

            <TouchableOpacity style={styles.prefRow} onPress={handleResetData}>
              <View style={styles.prefLeft}>
                <RotateCcw size={18} color="#E65100" />
                <Text style={[styles.prefText, { color: '#E65100' }]}>
                  Restablecer Datos Demo
                </Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Botón Cerrar Sesión */}
        <View style={styles.logoutContainer}>
          <Button
            title="Cerrar Sesión"
            icon={LogOut}
            variant="danger"
            size="medium"
            onPress={() => setLogoutModalVisible(true)}
            fullWidth
          />
          <Text style={styles.versionText}>SIGA Mobile RD • Versión 1.0.0 (Expo SDK 52)</Text>
        </View>
      </ScrollView>

      {/* Modal Flotante de Confirmación de Cierre de Sesión */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconCircle}>
              <LogOut size={26} color="#DC2626" />
            </View>

            <Text style={styles.modalTitle}>¿Cerrar Sesión?</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseas salir de tu cuenta en SIGA? Tendrás que ingresar tus credenciales para acceder nuevamente.
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmText}>Sí, Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Edición de Perfil */}
      <ProfileEditModal
        visible={editModalVisible}
        user={user}
        onClose={() => setEditModalVisible(false)}
        onSave={updateProfile}
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
  editHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  userBanner: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    gap: 6,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  userCompany: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  roleSwitchCard: {
    marginHorizontal: 16,
    padding: 14,
    marginBottom: 12,
  },
  roleSwitchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  roleSwitchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  roleSwitchSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleBtnTextActive: {
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  infoCard: {
    padding: 14,
    marginVertical: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  prefsCard: {
    padding: 14,
    marginVertical: 0,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prefText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  prefRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prefValueText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalConfirmBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
