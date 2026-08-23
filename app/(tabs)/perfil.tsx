import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir de SIGA?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
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
            onPress={handleLogout}
            fullWidth
          />
          <Text style={styles.versionText}>SIGA Mobile RD • Versión 1.0.0 (Expo SDK 52)</Text>
        </View>
      </ScrollView>

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
    paddingBottom: 40,
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
});
