import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { COLORS } from '@/theme/colors';

interface CustomsLogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const CustomsLogo: React.FC<CustomsLogoProps> = ({
  size = 'medium',
  showSubtitle = false,
  inverted = false,
}) => {
  const iconSize = size === 'small' ? 24 : size === 'large' ? 36 : 28;
  const titleSize = size === 'small' ? 18 : size === 'large' ? 24 : 20;

  const textColor = inverted ? COLORS.white : COLORS.textPrimary;
  const iconColor = inverted ? COLORS.white : COLORS.primary;

  return (
    <View style={styles.container}>
      <ShieldCheck size={iconSize} color={iconColor} strokeWidth={2.2} />
      <View style={styles.titleRow}>
        <Text style={[styles.title, { fontSize: titleSize, color: textColor }]}>SIGA</Text>
        <View style={styles.flagPill}>
          <View style={styles.flagBlue} />
          <View style={styles.flagWhite} />
          <View style={styles.flagRed} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  flagPill: {
    flexDirection: 'row',
    height: 10,
    width: 18,
    borderRadius: 2.5,
    overflow: 'hidden',
    marginLeft: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  flagBlue: {
    flex: 1,
    backgroundColor: '#002B66',
  },
  flagWhite: {
    flex: 0.8,
    backgroundColor: '#FFFFFF',
  },
  flagRed: {
    flex: 1,
    backgroundColor: '#CE1126',
  },
});

