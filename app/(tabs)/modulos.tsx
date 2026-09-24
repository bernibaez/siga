import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
  MessageSquare,
  FileCheck2,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { IGRAEstado } from '@/types';


export default function ModulosScreen() {
  const { user, isVerificador } = useAuth();
  const { igras, expedientes, updateIGRA } = useData();

  const [searchQuery, setSearchQuery] = useState('');


  // Acciones de Verificador para IGRA
  const handleUpdateIGRAEstado = (igraId: string, nuevoEstado: IGRAEstado) => {
    Alert.alert(
      'Autorización de Retiro IGRA',
      `¿Confirmas la actualización del IGRA a "${nuevoEstado.toUpperCase()}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Proceder',
          onPress: async () => {
            await updateIGRA(
              igraId,
              nuevoEstado,
              `Resolución IGRA: ${nuevoEstado} por ${user?.name || 'Oficial DGA'}.`
            );
          },
        },
      ]
    );
  };


  const filteredIGRAs = igras.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.id.toLowerCase().includes(q) || item.expedienteId.toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Módulo IGRA</Text>
          <Text style={styles.headerSubtitle}>
            Retiro y Pase de Salida Aduanero • República Dominicana
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Buscador */}
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por referencia IGRA o declaración..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Lista de Registros IGRA */}
        <View style={styles.moduleList}>
          {filteredIGRAs.map((item) => {
            const exp = expedientes.find((e) => e.id === item.expedienteId);
            return (
              <Card key={item.id} variant="elevated" style={styles.moduleCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.itemNumber}>IGRA: {exp?.numero || item.expedienteId}</Text>
                    <Text style={styles.itemSub}>Pase de Retiro Aduanal</Text>
                  </View>
                  <StatusBadge status={item.estado} />
                </View>

                <View style={styles.detailBox}>
                  <Text style={styles.detailExp}>Mercancía: {exp?.mercancia || 'Carga general'}</Text>
                  {item.fechaDespacho ? (
                    <Text style={[styles.detailDate, { color: COLORS.primaryDark, fontWeight: '700' }]}>
                      Despachado: {new Date(item.fechaDespacho).toLocaleDateString()}
                    </Text>
                  ) : (
                    <Text style={styles.detailDate}>Estado: En espera de liquidación</Text>
                  )}
                </View>

                {item.observaciones && item.observaciones.length > 0 && (
                  <View style={styles.obsBox}>
                    <MessageSquare size={13} color={COLORS.textMuted} />
                    <Text style={styles.obsText}>{item.observaciones[0]}</Text>
                  </View>
                )}

                {isVerificador && (
                  <View style={styles.igraBtnRow}>
                    <Button
                      title="Aprobar Retiro"
                      variant="success"
                      size="small"
                      icon={CheckCircle2}
                      onPress={() => handleUpdateIGRAEstado(item.id, 'aprobado')}
                      style={{ flex: 1, marginRight: 6 }}
                    />
                    <Button
                      title="Rechazar"
                      variant="danger"
                      size="small"
                      onPress={() => handleUpdateIGRAEstado(item.id, 'rechazado')}
                      style={{ flex: 0.8 }}
                    />
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  moduleList: {
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 12,
  },
  moduleCard: {
    padding: 16,
    marginVertical: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  itemSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  detailBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    gap: 2,
  },
  detailExp: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detailDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  obsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  obsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  igraBtnRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
});
