import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { COLORS } from '@/theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

type SuccessType = 'pago' | 'expediente';

interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  anim: Animated.Value;
  animX: Animated.Value;
  rotation: Animated.Value;
  delay: number;
  shape: 'circle' | 'square' | 'diamond';
}

interface SuccessModalProps {
  visible: boolean;
  type: SuccessType;
  title?: string;
  subtitle?: string;
  detail?: string;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

const PAYMENT_PARTICLES = [
  '#1B5E20', '#2E7D32', '#4CAF50', '#FFD700', '#FFC107',
  '#00BCD4', '#0288D1', '#1565C0', '#7B1FA2', '#E91E63',
];
const EXPEDIENTE_PARTICLES = [
  '#1565C0', '#1976D2', '#42A5F5', '#26C6DA', '#00ACC1',
  '#2E7D32', '#43A047', '#FFD600', '#F57F17', '#6A1B9A',
];

function generateParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 30 + Math.random() * (SCREEN_WIDTH - 60),
    y: SCREEN_HEIGHT * 0.28 + Math.random() * (SCREEN_HEIGHT * 0.28),
    color: colors[i % colors.length],
    size: 4 + Math.random() * 7,
    anim: new Animated.Value(0),
    animX: new Animated.Value(0),
    rotation: new Animated.Value(0),
    delay: i * 28,
    shape: (['circle', 'square', 'diamond'] as const)[Math.floor(Math.random() * 3)],
  }));
}

export function SuccessModal({
  visible,
  type,
  title,
  subtitle,
  detail,
  onClose,
  onAction,
  actionLabel = 'Continuar',
}: SuccessModalProps) {
  const isPago = type === 'pago';
  const particleColors = isPago ? PAYMENT_PARTICLES : EXPEDIENTE_PARTICLES;
  const particles = useRef<Particle[]>(generateParticles(28, particleColors)).current;

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const outerRingScale = useRef(new Animated.Value(0)).current;
  const outerRingOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const detailAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current;

  const resetAll = useCallback(() => {
    overlayAnim.setValue(0);
    cardAnim.setValue(0);
    cardSlide.setValue(60);
    ringScale.setValue(0);
    ringOpacity.setValue(0);
    outerRingScale.setValue(0);
    outerRingOpacity.setValue(0);
    pulseAnim.setValue(1);
    checkAnim.setValue(0);
    iconScale.setValue(0);
    titleAnim.setValue(0);
    subtitleAnim.setValue(0);
    detailAnim.setValue(0);
    buttonAnim.setValue(0);
    shineAnim.setValue(-1);
    particles.forEach((p) => {
      p.anim.setValue(0);
      p.animX.setValue(0);
      p.rotation.setValue(0);
    });
  }, []);

  const launchAnimation = useCallback(() => {
    Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(ringScale, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 200);

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(outerRingScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(outerRingOpacity, { toValue: 0.4, duration: 400, useNativeDriver: true }),
          Animated.timing(outerRingOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]).start();
    }, 300);

    setTimeout(() => {
      Animated.spring(iconScale, { toValue: 1, tension: 120, friction: 5, useNativeDriver: true }).start();
    }, 350);

    setTimeout(() => {
      Animated.timing(checkAnim, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, 450);

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, 700);

    setTimeout(() => {
      Animated.loop(
        Animated.timing(shineAnim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ).start();
    }, 800);

    setTimeout(() => {
      Animated.stagger(100, [
        Animated.spring(titleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.spring(subtitleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.spring(detailAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.spring(buttonAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();
    }, 600);

    particles.forEach((p) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(p.anim, {
            toValue: 1, duration: 900 + Math.random() * 500,
            easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
          Animated.timing(p.animX, {
            toValue: (Math.random() - 0.5) * 2, duration: 900 + Math.random() * 500,
            easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
          Animated.timing(p.rotation, {
            toValue: (Math.random() - 0.5) * 6, duration: 900 + Math.random() * 500,
            easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
        ]).start();
      }, p.delay + 300);
    });
  }, []);

  useEffect(() => {
    if (visible) {
      resetAll();
      launchAnimation();
    }
  }, [visible]);

  const defaultTitle = isPago ? '¡Pago Procesado!' : '¡Expediente Creado!';
  const defaultSubtitle = isPago
    ? 'Tu liquidación aduanera fue registrada exitosamente.'
    : 'El expediente fue ingresado al sistema DGA con éxito.';

  const accentColor = isPago ? '#1B5E20' : '#1565C0';
  const accentLight = isPago ? '#E8F5E9' : '#E3F2FD';
  const accentMid = isPago ? '#4CAF50' : '#42A5F5';
  const accentGold = isPago ? '#FFD700' : '#00BCD4';

  const shineTX = shineAnim.interpolate({ inputRange: [-1, 1], outputRange: [-200, 280] });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        {/* Confetti Particles */}
        {particles.map((p, i) => {
          const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -(80 + Math.random() * 120)] });
          const translateX = p.animX.interpolate({ inputRange: [-2, 2], outputRange: [-60, 60] });
          const opacity = p.anim.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 1, 1, 0] });
          const rotate = p.rotation.interpolate({ inputRange: [-3, 3], outputRange: ['-180deg', '180deg'] });
          return (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  opacity,
                  transform: [{ translateY }, { translateX }, { rotate }],
                  borderRadius: p.shape === 'circle' ? p.size / 2 : p.shape === 'square' ? 2 : 0,
                },
              ]}
            />
          );
        })}

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardAnim, transform: [{ translateY: cardSlide }] },
          ]}
        >
          {/* Shine sweep */}
          <Animated.View
            style={[
              styles.shineSweep,
              { transform: [{ translateX: shineTX }, { skewX: '-20deg' }] },
            ]}
          />

          {/* Icon area */}
          <View style={styles.iconArea}>
            <Animated.View
              style={[
                styles.outerRing,
                {
                  borderColor: accentMid,
                  opacity: outerRingOpacity,
                  transform: [{ scale: outerRingScale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.iconCircleOuter,
                {
                  backgroundColor: accentLight,
                  opacity: ringOpacity,
                  transform: [{ scale: ringScale }, { scale: pulseAnim }],
                },
              ]}
            />
            <Animated.View style={[styles.iconSvgWrapper, { transform: [{ scale: iconScale }] }]}>
              {isPago ? (
                <PaymentCheckIcon color={accentColor} checkProgress={checkAnim} accentGold={accentGold} />
              ) : (
                <ExpedienteCheckIcon color={accentColor} checkProgress={checkAnim} accentMid={accentMid} />
              )}
            </Animated.View>
          </View>

          {/* Badge */}
          <Animated.View
            style={[
              styles.badgeLabel,
              {
                backgroundColor: accentLight,
                opacity: titleAnim,
                transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
              },
            ]}
          >
            <View style={[styles.badgeDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.badgeText, { color: accentColor }]}>
              {isPago ? 'Transacción DGA Exitosa' : 'Registro Aduanero Completado'}
            </Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            style={[
              styles.titleText,
              {
                opacity: titleAnim,
                transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
              },
            ]}
          >
            {title || defaultTitle}
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            style={[
              styles.subtitleText,
              {
                opacity: subtitleAnim,
                transform: [{ translateY: subtitleAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
              },
            ]}
          >
            {subtitle || defaultSubtitle}
          </Animated.Text>

          {/* Detail box */}
          {detail && (
            <Animated.View
              style={[
                styles.detailBox,
                {
                  borderColor: accentMid + '40',
                  backgroundColor: accentLight,
                  opacity: detailAnim,
                  transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
                },
              ]}
            >
              <Text style={[styles.detailText, { color: accentColor }]}>{detail}</Text>
            </Animated.View>
          )}

          <View style={styles.divider} />

          {/* Buttons */}
          <Animated.View
            style={[
              styles.buttonsRow,
              {
                opacity: buttonAnim,
                transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
              },
            ]}
          >
            {onAction && (
              <TouchableOpacity
                onPress={onAction}
                style={[styles.btnSecondary, { borderColor: accentColor }]}
                activeOpacity={0.75}
              >
                <Text style={[styles.btnSecondaryText, { color: accentColor }]}>
                  {isPago ? 'Ver Comprobante' : 'Ver Expediente'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              style={[styles.btnPrimary, { backgroundColor: accentColor, flex: onAction ? 1 : undefined }]}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>{actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Payment Check Icon ──────────────────────────────────────────────────────
function PaymentCheckIcon({
  color, checkProgress, accentGold,
}: {
  color: string; checkProgress: Animated.Value; accentGold: string;
}) {
  const strokeDashoffset = checkProgress.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });
  return (
    <Svg width={90} height={90} viewBox="0 0 90 90">
      <Circle cx="45" cy="45" r="42" stroke={color} strokeWidth="1.5" strokeDasharray="8 4" fill="none" opacity={0.3} />
      <Circle cx="45" cy="45" r="34" fill={color} />
      <Circle cx="45" cy="45" r="22" fill={accentGold} opacity={0.18} />
      <AnimatedPath
        d="M30 45 L41 56 L62 34"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="60"
        strokeDashoffset={strokeDashoffset as any}
      />
      <Circle cx="68" cy="22" r="4" fill={accentGold} />
      <Circle cx="22" cy="20" r="2.5" fill={accentGold} opacity={0.7} />
      <Circle cx="74" cy="65" r="3" fill={accentGold} opacity={0.6} />
    </Svg>
  );
}

// ─── Expediente Check Icon ───────────────────────────────────────────────────
function ExpedienteCheckIcon({
  color, checkProgress, accentMid,
}: {
  color: string; checkProgress: Animated.Value; accentMid: string;
}) {
  const strokeDashoffset = checkProgress.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });
  return (
    <Svg width={90} height={90} viewBox="0 0 90 90">
      <Circle cx="45" cy="45" r="42" stroke={color} strokeWidth="1.5" strokeDasharray="6 5" fill="none" opacity={0.25} />
      <Circle cx="45" cy="45" r="34" fill={color} />
      <Circle cx="45" cy="45" r="22" fill={accentMid} opacity={0.18} />
      <AnimatedPath
        d="M30 45 L41 56 L62 34"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="60"
        strokeDashoffset={strokeDashoffset as any}
      />
      <Line x1="20" y1="18" x2="28" y2="18" stroke={accentMid} strokeWidth="2" strokeLinecap="round" opacity={0.6} />
      <Line x1="20" y1="23" x2="24" y2="23" stroke={accentMid} strokeWidth="2" strokeLinecap="round" opacity={0.4} />
      <Circle cx="70" cy="20" r="3.5" fill={accentMid} opacity={0.7} />
      <Circle cx="72" cy="68" r="2.5" fill={accentMid} opacity={0.5} />
    </Svg>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  particle: {
    position: 'absolute',
    zIndex: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 24,
    overflow: 'hidden',
    zIndex: 20,
  },
  shineSweep: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 80,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 5,
  },
  iconArea: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  outerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
  },
  iconCircleOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  iconSvgWrapper: {
    zIndex: 2,
  },
  badgeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  detailBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 18,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
