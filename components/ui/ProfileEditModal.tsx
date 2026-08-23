import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X, User as UserIcon, Phone, Mail, Building, FileCheck } from 'lucide-react-native';
import { COLORS } from '@/theme/colors';
import { Button } from './Button';
import { User } from '@/types';

interface ProfileEditModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (updated: Partial<User>) => Promise<void>;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  user,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [compania, setCompania] = useState(user?.compania || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setTelefono(user.telefono);
      setCompania(user.compania || '');
      setEmail(user.email);
    }
  }, [user, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingresa tu nombre completo.');
      return;
    }

    try {
      setSaving(true);
      await onSave({
        name,
        telefono,
        compania,
        email,
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      onClose();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo guardar la información.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Editar Perfil</Text>
              <Text style={styles.subtitle}>Actualiza tus datos de contacto en SIGA</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formBody} showsVerticalScrollIndicator={false}>
            {/* Nombre */}
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={styles.inputContainer}>
              <UserIcon size={18} color={COLORS.primaryDark} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nombre completo"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color={COLORS.primaryDark} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="correo@ejemplo.com"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Teléfono */}
            <Text style={styles.label}>Teléfono de Contacto</Text>
            <View style={styles.inputContainer}>
              <Phone size={18} color={COLORS.primaryDark} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                placeholder="(809) 000-0000"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Compañía / Entidad */}
            <Text style={styles.label}>Empresa o Dependencia</Text>
            <View style={styles.inputContainer}>
              <Building size={18} color={COLORS.primaryDark} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={compania}
                onChangeText={setCompania}
                placeholder="Razón Social / Aduanas RD"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.readOnlyBox}>
              <FileCheck size={16} color={COLORS.neutralDark} />
              <Text style={styles.readOnlyText}>
                Cédula / RNC ({user?.cedula}) validado ante DGII / DGA
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              size="medium"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Guardar Cambios"
              variant="primary"
              size="medium"
              loading={saving}
              onPress={handleSave}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  formBody: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 6,
    gap: 8,
  },
  readOnlyText: {
    fontSize: 11,
    color: COLORS.neutralDark,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
