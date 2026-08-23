import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react-native';
import { COLORS } from '@/theme/colors';
import { Documento } from '@/types';

interface FileUploadProps {
  onFileSelected: (documento: Documento) => void;
  maxSizeMB?: number;
  uploadedBy?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  maxSizeMB = 10,
  uploadedBy = 'Usuario',
  disabled = false,
}) => {
  const [isPicking, setIsPicking] = useState(false);
  const [lastUploadedName, setLastUploadedName] = useState<string | null>(null);

  const handlePickDocument = async () => {
    if (disabled || isPicking) return;

    try {
      setIsPicking(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileSize = asset.size || 0;
        const maxBytes = maxSizeMB * 1024 * 1024;

        if (fileSize > maxBytes) {
          Alert.alert(
            'Archivo muy pesado',
            `El archivo seleccionado supera el límite máximo permitido de ${maxSizeMB}MB.`
          );
          return;
        }

        const newDoc: Documento = {
          id: `doc-${Date.now()}`,
          nombre: asset.name || 'documento_aduanal.pdf',
          tipo: asset.mimeType || 'application/pdf',
          url: asset.uri,
          fechaSubida: new Date().toISOString(),
          subidoPor: uploadedBy,
          size: fileSize,
        };

        setLastUploadedName(asset.name || 'Documento adjunto');
        onFileSelected(newDoc);
      }
    } catch (error) {
      console.error('Error al seleccionar documento:', error);
      Alert.alert('Error', 'No se pudo cargar el documento.');
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePickDocument}
      activeOpacity={0.8}
      disabled={disabled || isPicking}
      style={[
        styles.container,
        disabled && styles.disabled,
        lastUploadedName ? styles.successBorder : styles.defaultBorder,
      ]}
    >
      <View style={styles.iconCircle}>
        {isPicking ? (
          <ActivityIndicator size="small" color={COLORS.primaryDark} />
        ) : lastUploadedName ? (
          <CheckCircle size={24} color={COLORS.primaryDark} />
        ) : (
          <UploadCloud size={24} color={COLORS.primaryDark} />
        )}
      </View>

      <Text style={styles.title}>
        {isPicking
          ? 'Procesando archivo...'
          : lastUploadedName
          ? `Listo: ${lastUploadedName}`
          : 'Adjuntar Factura, B/L o Certificado'}
      </Text>
      <Text style={styles.subtitle}>
        Formatos permitidos: PDF, JPG, PNG (Máx. {maxSizeMB}MB)
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    marginVertical: 8,
  },
  defaultBorder: {
    borderColor: COLORS.primaryLight,
  },
  successBorder: {
    borderColor: COLORS.primaryDark,
    backgroundColor: '#F1F8E9',
  },
  disabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
