import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileCheck2,
  PackageCheck,
  Truck,
  DollarSign,
  Search,
  FileText,
  ShieldCheck,
} from 'lucide-react-native';
import { STATUS_COLORS } from '@/theme/colors';

type AnyStatus =
  | 'registrado_aceptado'
  | 'registrado/aceptado'
  | 'inspeccionando'
  | 'aprobado'
  | 'despacho_aprobado'
  | 'despacho aprobado'
  | 'pendiente'
  | 'revision'
  | 'pagado'
  | 'rechazado'
  | 'completo'
  | 'incompleto'
  | 'lista'
  | 'proceso'
  | 'retenida'
  | 'liberada'
  | 'parcial';

interface StatusBadgeProps {
  status: AnyStatus | string;
  size?: 'small' | 'medium';
  showIcon?: boolean;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true,
  style,
}) => {
  const normStatus = (status || '').toLowerCase().trim() as AnyStatus;
  const config = (STATUS_COLORS as Record<string, { bg: string; text: string; border: string; label: string }>)[normStatus] || {
    bg: '#F5F5F5',
    text: '#616161',
    border: '#E0E0E0',
    label: status || 'Desconocido',
  };

  const isSmall = size === 'small';
  const iconSize = isSmall ? 11 : 13;

  const renderIcon = () => {
    if (!showIcon) return null;
    const color = config.text;

    switch (normStatus) {
      case 'registrado_aceptado':
      case 'registrado/aceptado':
        return <FileText size={iconSize} color={color} style={styles.icon} />;
      case 'inspeccionando':
        return <Search size={iconSize} color={color} style={styles.icon} />;
      case 'aprobado':
        return <CheckCircle2 size={iconSize} color={color} style={styles.icon} />;
      case 'despacho_aprobado':
      case 'despacho aprobado':
        return <ShieldCheck size={iconSize} color={color} style={styles.icon} />;
      case 'pendiente':
        return <Clock size={iconSize} color={color} style={styles.icon} />;
      case 'revision':
        return <FileCheck2 size={iconSize} color={color} style={styles.icon} />;
      case 'pagado':
        return <DollarSign size={iconSize} color={color} style={styles.icon} />;
      case 'rechazado':
      case 'retenida':
        return <XCircle size={iconSize} color={color} style={styles.icon} />;
      case 'completo':
      case 'liberada':
        return <CheckCircle2 size={iconSize} color={color} style={styles.icon} />;
      case 'incompleto':
      case 'parcial':
        return <AlertCircle size={iconSize} color={color} style={styles.icon} />;
      case 'lista':
      case 'proceso':
        return <PackageCheck size={iconSize} color={color} style={styles.icon} />;
      default:
        return <Clock size={iconSize} color={color} style={styles.icon} />;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 7 : 10,
          borderRadius: isSmall ? 6 : 8,
        },
        style,
      ]}
    >
      {renderIcon()}
      <Text
        style={[
          styles.label,
          {
            color: config.text,
            fontSize: isSmall ? 11 : 12,
            fontWeight: '600',
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },
});
