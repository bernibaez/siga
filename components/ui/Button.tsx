import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return [COLORS.primary, COLORS.primaryDark];
      case 'success':
        return ['#4CAF50', '#2E7D32'];
      case 'danger':
        return ['#E53935', '#C62828'];
      case 'warning':
        return ['#FFA000', '#F57C00'];
      case 'secondary':
        return [COLORS.accentNavy, '#092543'];
      default:
        return [COLORS.primary, COLORS.primaryDark];
    }
  };

  const isGradient = ['primary', 'success', 'danger', 'warning', 'secondary'].includes(variant);

  const getContainerStyle = (): ViewStyle => {
    let sizeStyle: ViewStyle;
    switch (size) {
      case 'small':
        sizeStyle = { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 };
        break;
      case 'large':
        sizeStyle = { paddingVertical: 15, paddingHorizontal: 22, borderRadius: 14 };
        break;
      default:
        sizeStyle = { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 };
    }

    let borderStyle: ViewStyle = {};
    if (variant === 'outline') {
      borderStyle = {
        borderWidth: 1.5,
        borderColor: COLORS.primaryDark,
        backgroundColor: 'transparent',
      };
    } else if (variant === 'ghost') {
      borderStyle = {
        backgroundColor: 'transparent',
      };
    }

    return {
      ...sizeStyle,
      ...borderStyle,
      width: fullWidth ? '100%' : undefined,
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') {
      return COLORS.primaryDark;
    }
    return COLORS.white;
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 13;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 20 : 18;
  const contentColor = getTextColor();

  const renderContent = () => (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} style={{ marginRight: 8 }} />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={iconSize} color={contentColor} style={styles.leftIcon} />
      )}
      <Text
        style={[
          styles.text,
          {
            color: contentColor,
            fontSize: getFontSize(),
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={iconSize} color={contentColor} style={styles.rightIcon} />
      )}
    </View>
  );

  if (isGradient && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.baseButton, getContainerStyle()]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[styles.baseButton, getContainerStyle(), style]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
