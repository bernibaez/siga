import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { COLORS } from '@/theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.borderLight,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        };
      case 'outlined':
        return {
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.border,
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'subtle':
        return {
          backgroundColor: COLORS.surfaceSubtle,
          borderWidth: 1,
          borderColor: COLORS.borderLight,
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return {
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.borderLight,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 4,
          elevation: 1,
        };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[styles.card, getVariantStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
  },
});

