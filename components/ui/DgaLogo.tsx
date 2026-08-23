import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DgaLogoProps {
  width?: number;
  height?: number;
}

// Recreamos el logo DGA con texto estilizado + colores oficiales (fallback sin SVG)
export const DgaLogo: React.FC<DgaLogoProps> = ({ width = 200, height = 70 }) => {
  return (
    <View style={[styles.container, { width, height }]}>
      {/* D - Azul Marino */}
      <View style={styles.letterWrapper}>
        <Text style={[styles.letter, styles.letterD]}>D</Text>
      </View>

      {/* Flechas decorativas apuntando izquierda como en logo DGA */}
      <View style={styles.arrowsWrapper}>
        <View style={[styles.arrow, styles.arrowBlue]} />
        <View style={[styles.arrow, styles.arrowGreen, { top: 18 }]} />
      </View>

      {/* G - Verde */}
      <View style={styles.letterWrapper}>
        <Text style={[styles.letter, styles.letterG]}>G</Text>
      </View>

      {/* Separador decorativo */}
      <View style={styles.separator} />

      {/* A - Cyan Azul con triángulo inferior */}
      <View style={styles.letterWrapper}>
        <Text style={[styles.letter, styles.letterA]}>A</Text>
        <View style={styles.aUnderline} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  letter: {
    fontSize: 62,
    fontWeight: '900',
    lineHeight: 70,
    letterSpacing: -2,
  },
  letterD: {
    color: '#002D62',
    fontStyle: 'italic',
  },
  letterG: {
    color: '#78BE20',
    fontStyle: 'italic',
    marginLeft: 2,
  },
  letterA: {
    color: '#009FE3',
    fontStyle: 'italic',
    marginLeft: 2,
  },
  aUnderline: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#009FE3',
    borderRadius: 2,
  },
  arrowsWrapper: {
    position: 'absolute',
    left: 12,
    top: 10,
    width: 12,
    height: 50,
  },
  arrow: {
    position: 'absolute',
    left: 0,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  arrowBlue: {
    top: 4,
    borderRightColor: '#FFFFFF',
  },
  arrowGreen: {
    borderRightColor: '#FFFFFF',
  },
  separator: {
    display: 'none',
  },
});
