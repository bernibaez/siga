import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Image as ImageIcon, Trash2, ExternalLink } from 'lucide-react-native';
import { COLORS } from '@/theme/colors';
import { Documento } from '@/types';

interface FilePreviewProps {
  documentos: Documento[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  documentos,
  onRemove,
  readOnly = false,
}) => {
  if (!documentos || documentos.length === 0) {
    return null;
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Tamaño no disp.';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (tipo: string) => {
    return tipo.includes('image') || tipo.includes('png') || tipo.includes('jpg') || tipo.includes('jpeg');
  };

  return (
    <View style={styles.container}>
      {documentos.map((doc) => (
        <View key={doc.id} style={styles.itemCard}>
          <View style={styles.iconContainer}>
            {isImage(doc.tipo) ? (
              <ImageIcon size={20} color={COLORS.primaryDark} />
            ) : (
              <FileText size={20} color={COLORS.primaryDark} />
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.fileName} numberOfLines={1}>
              {doc.nombre}
            </Text>
            <View style={styles.subInfoRow}>
              <Text style={styles.subText}>{formatFileSize(doc.size)}</Text>
              <Text style={styles.subDot}>•</Text>
              <Text style={styles.subText}>Subido por: {doc.subidoPor}</Text>
            </View>
          </View>

          {!readOnly && onRemove && (
            <TouchableOpacity
              onPress={() => onRemove(doc.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteButton}
            >
              <Trash2 size={18} color={COLORS.alert} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  subDot: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginHorizontal: 4,
  },
  deleteButton: {
    padding: 6,
  },
});
