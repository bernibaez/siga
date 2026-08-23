import React from 'react';
import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Folder,
  Layers,
  Search,
  User,
} from 'lucide-react-native';
import { COLORS } from '@/theme/colors';
import { AlonsoChatBot } from '@/components/ui/AlonsoChatBot';
import { useData } from '@/contexts/DataContext';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { expedientes } = useData();

  const pendingExpCount = expedientes.filter(
    (e) =>
      e.estado === 'inspeccionando' ||
      e.estado === 'registrado_aceptado' ||
      e.estado === 'pendiente'
  ).length;

  // Altura y padding dinámico para que no se corte el texto en ningún dispositivo
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 10);
  const tabHeight = 58 + bottomInset;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#002D62',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E2E8F0',
            borderTopWidth: 1,
            height: tabHeight,
            paddingBottom: bottomInset,
            paddingTop: 6,
            elevation: 10,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            height: 48,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: 2,
            marginBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} strokeWidth={1.8} />,
          }}
        />

        <Tabs.Screen
          name="expedientes"
          options={{
            title: 'Expedientes',
            tabBarIcon: ({ color, size }) => <Folder size={size || 22} color={color} strokeWidth={1.8} />,
            tabBarBadge: pendingExpCount > 0 ? pendingExpCount : undefined,
            tabBarBadgeStyle: { backgroundColor: COLORS.warning, fontSize: 10 },
          }}
        />

        <Tabs.Screen
          name="modulos"
          options={{
            title: 'Trámites',
            tabBarIcon: ({ color, size }) => <Layers size={size || 22} color={color} strokeWidth={1.8} />,
          }}
        />

        <Tabs.Screen
          name="buscador"
          options={{
            title: 'Buscar',
            tabBarIcon: ({ color, size }) => <Search size={size || 22} color={color} strokeWidth={1.8} />,
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} strokeWidth={1.8} />,
          }}
        />

        <Tabs.Screen
          name="pagos"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Botón flotante de Asistente Virtual Alonso */}
      <AlonsoChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

