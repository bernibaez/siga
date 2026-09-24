import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText,
  Building2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '@/contexts/AuthContext';
import { DgaLogo } from '@/components/ui/DgaLogo';

export default function LoginScreen() {
  const [rncOrCedula, setRncOrCedula] = useState('130-98765-4');
  const [declaracion, setDeclaracion] = useState('10030eejemplo');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Formatear RNC (9 dígitos: XXX-XXXXX-X) o Cédula (11 dígitos: XXX-XXXXXXX-X)
  const formatRncOrCedula = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;

    // Si tiene 10 u 11 dígitos, formatear como Cédula (XXX-XXXXXXX-X)
    if (digits.length > 9) {
      if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 10)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10, 11)}`;
    }

    // Si tiene hasta 9 dígitos, formatear como RNC (XXX-XXXXX-X)
    if (digits.length <= 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 8)}-${digits.slice(8, 9)}`;
  };

  const handleRncOrCedulaChange = (text: string) => {
    setRncOrCedula(formatRncOrCedula(text));
  };

  const handleLogin = async () => {
    const cleanRnc = rncOrCedula.trim();
    const cleanDec = declaracion.trim();
    const cleanPass = password.trim();

    if (!cleanRnc || !cleanDec || !cleanPass) {
      Alert.alert(
        'Datos requeridos',
        'Por favor completa tu RNC o Cédula, Declaración y Contraseña.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanRnc || cleanDec, cleanPass);
      if (res.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', res.message || 'Credenciales inválidas.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.mainContainer}
    >
      {/* Fondo decorativo con ondas suaves */}
      <View style={styles.backgroundDecorations} pointerEvents="none">
        {/* Curva verde menta inferior izquierda */}
        <View style={styles.bottomLeftGreenCurve} />
        {/* Curva azul suave inferior derecha */}
        <View style={styles.bottomRightBlueCurve} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo DGA Oficial */}
        <View style={styles.logoSection}>
          <DgaLogo width={170} height={70} />
        </View>

        {/* Títulos */}
        <View style={styles.titleSection}>
          <Text style={styles.welcomeTitle}>Bienvenido de nuevo</Text>
          <Text style={styles.welcomeSubtitle}>
            Inicia sesión para continuar{'\n'}en tu plataforma SIGA
          </Text>
        </View>

        {/* Formulario Unificado de 3 Campos */}
        <View style={styles.formContainer}>
          {/* 1. RNC o Cédula */}
          <View style={styles.inputGroup}>
            <View style={styles.rncLabelRow}>
              <Text style={styles.inputLabel}>RNC</Text>
              <Text style={styles.rncHintText}>9 u 11 dígitos</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Building2 size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                value={rncOrCedula}
                onChangeText={handleRncOrCedulaChange}
                placeholder="130-98765-4 o 001-1234567-8"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={13}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 2. Declaración */}
          <View style={[styles.inputGroup, { marginTop: 16 }]}>
            <Text style={styles.inputLabel}>Declaración</Text>
            <View style={styles.inputWrapper}>
              <FileText size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                value={declaracion}
                onChangeText={setDeclaracion}
                placeholder="10030-IC01-2608-0025FB"
                placeholderTextColor="#94A3B8"
                keyboardType="default"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 3. Campo Contraseña */}
          <View style={[styles.inputGroup, { marginTop: 16 }]}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#94A3B8" />
                ) : (
                  <Eye size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Enlace Olvidaste tu contraseña */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => Alert.alert('Recuperación', 'Se ha enviado un enlace de recuperación a tu correo registrado.')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón Principal Iniciar sesión */}
          <TouchableOpacity
            style={styles.primaryLoginButton}
            onPress={handleLogin}
            activeOpacity={0.88}
            disabled={loading}
          >
            <Text style={styles.primaryLoginButtonText}>
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Separador o continúa con */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botón Continuar con Google */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" style={styles.googleIcon}>
              <Path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <Path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <Path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <Path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </Svg>
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Pie de página de registro */}
          <View style={styles.registerRow}>
            <Text style={styles.noAccountText}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => Alert.alert('Registro', 'El registro de nuevos operadores se gestiona en la VUCE / DGA.')}>
              <Text style={styles.registerLinkText}> Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundDecorations: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  bottomLeftGreenCurve: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#EEF7EE',
    opacity: 0.85,
  },
  bottomRightBlueCurve: {
    position: 'absolute',
    bottom: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#EBF5FC',
    opacity: 0.8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 68 : 48,
    paddingBottom: 36,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 26,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B192C',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    width: '100%',
  },
  rncLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rncHintText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284C7',
  },
  primaryLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#002B66',
    borderRadius: 14,
    height: 52,
    gap: 8,
    shadowColor: '#002B66',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryLoginButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 52,
    gap: 10,
  },
  googleIcon: {
    marginRight: 2,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
  },
  noAccountText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
});
