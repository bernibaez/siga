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
  Ship,
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
import { IGEAEstado, IGRAEstado } from '@/types';

type ModuleType = 'IGEA' | 'IGRA';

export default function ModulosScreen() {
  const { user, isVerificador } = useAuth();
  const { igeas, igras, expedientes, updateIGEA, updateIGRA } = useData();

  const [activeModule, setActiveModule] = useState<ModuleType>('IGEA');
  const [searchQuery, setSearchQuery] = useState('');

  // Acciones de Verificador para IGEA
  const handleToggleIGEAEstado = (igeaId: string, currentEstado: IGEAEstado) => {
    const nuevoEstado: IGEAEstado = currentEstado === 'completo' ? 'incompleto' : 'completo';
    Alert.alert(
      'Actualizar Estado IGEA',
      `¿Deseas cambiar el estado de la Entrada Aduanera a "${nuevoEstado.toUpperCase()}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            await updateIGEA(
              igeaId,
              nuevoEstado,
              `Estado actualizado a ${nuevoEstado} por ${user?.name || 'Oficial DGA'}.`
            );
          },
        },
      ]
    );
  };

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

  const filteredIGEAs = igeas.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.numero.toLowerCase().includes(q) || item.manifiesto.toLowerCase().includes(q);
  });

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
          <Text style={styles.headerTitle}>Módulos IGEA & IGRA</Text>
          <Text style={styles.headerSubtitle}>
            Entrada y Retiro Aduanero • República Dominicana
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Selector de Módulo */}
        <View style={styles.moduleSelector}>
          <TouchableOpacity
            onPress={() => setActiveModule('IGEA')}
            activeOpacity={0.8}
            style={[styles.selectorBtn, activeModule === 'IGEA' && styles.selectorBtnActive]}
          >
            <Ship
              size={18}
              color={activeModule === 'IGEA' ? COLORS.white : COLORS.primaryDark}
            />
            <View>
              <Text
                style={[
                  styles.selectorTitle,
                  activeModule === 'IGEA' && styles.selectorTitleActive,
                ]}
              >
                IGEA (Entrada)
              </Text>
              <Text
                style={[
                  styles.selectorSub,
                  activeModule === 'IGEA' && styles.selectorSubActive,
                ]}
              >
                Gestión de Ingreso
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveModule('IGRA')}
            activeOpacity={0.8}
            style={[styles.selectorBtn, activeModule === 'IGRA' && styles.selectorBtnActive]}
          >
            <Truck
              size={18}
              color={activeModule === 'IGRA' ? COLORS.white : COLORS.primaryDark}
            />
            <View>
              <Text
                style={[
                  styles.selectorTitle,
                  activeModule === 'IGRA' && styles.selectorTitleActive,
                ]}
              >
                IGRA (Retiro)
              </Text>
              <Text
                style={[
                  styles.selectorSub,
                  activeModule === 'IGRA' && styles.selectorSubActive,
                ]}
              >
                Autorización de Salida
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Buscar por manifiesto o referencia ${activeModule}...`}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Lista de Registros del Módulo Activo */}
        <View style={styles.moduleList}>
          {activeModule === 'IGEA' ? (
            filteredIGEAs.map((item) => {
              const exp = expedientes.find((e) => e.id === item.expedienteId);
              return (
                <Card key={item.id} variant="elevated" style={styles.moduleCard}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.itemNumber}>{item.numero}</Text>
                      <Text style={styles.itemSub}>Manifiesto: {item.manifiesto}</Text>
                    </View>
                    <StatusBadge status={item.estado} />
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.detailExp}>
                      Expediente Asociado: {exp?.numero || item.expedienteId}
                    </Text>
                    <Text style={styles.detailDate}>
                      Registro: {new Date(item.fechaRegistro).toLocaleDateString()}
                    </Text>
                  </View>

                  {item.observaciones && item.observaciones.length > 0 && (
                    <View style={styles.obsBox}>
                      <MessageSquare size={13} color={COLORS.textMuted} />
                      <Text style={styles.obsText}>{item.observaciones[0]}</Text>
                    </View>
                  )}

                  {isVerificador && (
                    <View style={styles.verificadorActions}>
                      <Button
                        title={item.estado === 'completo' ? 'Marcar Incompleto' : 'Validar Entrada Completa'}
                        variant={item.estado === 'completo' ? 'outline' : 'primary'}
                        size="small"
                        onPress={() => handleToggleIGEAEstado(item.id, item.estado)}
                        fullWidth
                      />
                    </View>
                  )}
                </Card>
              );
            })
          ) : (
            filteredIGRAs.map((item) => {
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
            })
          )}
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
    paddingBottom: 40,
  },
  moduleSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  selectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  selectorBtnActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  selectorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectorTitleActive: {
    color: COLORS.white,
  },
  selectorSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  selectorSubActive: {
    color: 'rgba(255,255,255,0.85)',
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
  verificadorActions: {
    marginTop: 4,
  },
  igraBtnRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
});
