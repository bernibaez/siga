import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Package,
  DollarSign,
  Weight,
  FileText,
  ShieldCheck,
  Calculator,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { COLORS } from '@/theme/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { FilePreview } from '@/components/ui/FilePreview';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { Documento } from '@/types';

export default function NuevoExpedienteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addExpediente, expedientes } = useData();

  // Auto-sugerir correlativo siguiente
  const nextNum = expedientes.length + 1;
  const padNum = nextNum.toString().padStart(3, '0');

  const [numero, setNumero] = useState(`EXP-2025-${padNum}`);
  const [declaracion, setDeclaracion] = useState(`DEC-${padNum}-2025`);
  const [consignatario, setConsignatario] = useState(user?.compania || 'Caribe Import Logistics S.R.L.');
  const [agencia, setAgencia] = useState('Agencia Aduanal Dominicana Express');
  const [mercancia, setMercancia] = useState('');
  const [valorFOB, setValorFOB] = useState('');
  const [valorCIF, setValorCIF] = useState('');
  const [peso, setPeso] = useState('');
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [createdNumero, setCreatedNumero] = useState('');

  // Cálculos automáticos en vivo
  const numericCIF = parseFloat(valorCIF) || 0;
  const numericFOB = parseFloat(valorFOB) || (numericCIF > 0 ? numericCIF * 0.92 : 0);
  const arancelCalculado = Math.round(numericCIF * 0.14); // Arancel estándar promedio 14%
  const itbisCalculado = Math.round((numericCIF + arancelCalculado) * 0.18); // ITBIS 18%
  const totalImpuestosCalculado = arancelCalculado + itbisCalculado;

  const handleAddDocument = (nuevoDoc: Documento) => {
    setDocumentos((prev) => [...prev, nuevoDoc]);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocumentos((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSubmit = async () => {
    if (!numero.trim() || !declaracion.trim() || !mercancia.trim()) {
      Alert.alert('Campos Incompletos', 'Por favor llena los campos de número, declaración y mercancía.');
      return;
    }

    if (numericCIF <= 0) {
      Alert.alert('Valor CIF Requerido', 'Por favor ingresa un valor CIF mayor a 0 para el cálculo de aranceles.');
      return;
    }

    const numericPeso = parseFloat(peso) || 100;

    try {
      setIsSubmitting(true);
      await addExpediente({
        numero,
        declaracion,
        importadorId: user?.id || 'usr-imp-01',
        importadorNombre: user?.name || 'Importador Registrado',
        consignatario,
        agencia,
        estado: 'fase_1_sin_abrir',
        valorFOB: numericFOB,
        valorCIF: numericCIF,
        peso: numericPeso,
        mercancia,
        impuestos: {
          arancel: arancelCalculado,
          selectivo: 0,
          itbis: itbisCalculado,
          total: totalImpuestosCalculado,
        },
        documentos,
        observaciones: [
          'Declaración registrada y aceptada en sistema digital SIGA.',
          'Documentos de soporte adjuntos listos para aforo.',
        ],
      });

      setCreatedNumero(numero);
      setSuccessVisible(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo registrar el expediente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Nuevo Expediente</Text>
          <Text style={styles.headerSubtitle}>Declaración de Importación DGA</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Identificación del Trámite */}
        <Card variant="default" style={styles.formCard}>
          <Text style={styles.sectionHeaderTitle}>Datos de la Declaración</Text>

          <View style={styles.rowInputs}>
            <View style={styles.colInput}>
              <Text style={styles.inputLabel}>No. Expediente</Text>
              <TextInput
                style={styles.input}
                value={numero}
                onChangeText={setNumero}
                placeholder="EXP-2025-001"
              />
            </View>
            <View style={styles.colInput}>
              <Text style={styles.inputLabel}>No. Declaración (DUA)</Text>
              <TextInput
                style={styles.input}
                value={declaracion}
                onChangeText={setDeclaracion}
                placeholder="DEC-001-2025"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Consignatario</Text>
          <TextInput
            style={styles.input}
            value={consignatario}
            onChangeText={setConsignatario}
            placeholder="Empresa consignataria"
          />

          <Text style={styles.inputLabel}>Agencia Aduanal</Text>
          <TextInput
            style={styles.input}
            value={agencia}
            onChangeText={setAgencia}
            placeholder="Agencia de aduanas autorizada"
          />
        </Card>

        {/* Mercancía y Valoración */}
        <Card variant="default" style={styles.formCard}>
          <Text style={styles.sectionHeaderTitle}>Detalle de la Carga & Valoración</Text>

          <Text style={styles.inputLabel}>Descripción de la Mercancía</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={mercancia}
            onChangeText={setMercancia}
            placeholder="Describe la naturaleza, partida arancelaria o tipos de bienes importados..."
            multiline
            numberOfLines={3}
          />

          <View style={styles.rowInputs}>
            <View style={styles.colInput}>
              <Text style={styles.inputLabel}>Valor FOB (USD)</Text>
              <TextInput
                style={styles.input}
                value={valorFOB}
                onChangeText={setValorFOB}
                keyboardType="decimal-pad"
                placeholder="40000"
              />
            </View>
            <View style={styles.colInput}>
              <Text style={styles.inputLabel}>Valor CIF (USD) *</Text>
              <TextInput
                style={[styles.input, { borderColor: COLORS.primaryDark }]}
                value={valorCIF}
                onChangeText={setValorCIF}
                keyboardType="decimal-pad"
                placeholder="45000"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Peso Bruto Total (kg)</Text>
          <TextInput
            style={styles.input}
            value={peso}
            onChangeText={setPeso}
            keyboardType="decimal-pad"
            placeholder="Ej: 1500"
          />
        </Card>

        {/* Cálculo de Impuestos en Vivo */}
        {numericCIF > 0 && (
          <Card variant="subtle" style={styles.formCard}>
            <View style={styles.calcHeader}>
              <Calculator size={16} color={COLORS.primaryDark} />
              <Text style={styles.calcTitle}>Liquidación Estimada de Tributos</Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Arancel Estimado (14%):</Text>
              <Text style={styles.calcValue}>USD ${arancelCalculado.toLocaleString()}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>ITBIS Aduanal (18%):</Text>
              <Text style={styles.calcValue}>USD ${itbisCalculado.toLocaleString()}</Text>
            </View>
            <View style={styles.calcDivider} />
            <View style={styles.calcTotalRow}>
              <Text style={styles.calcTotalLabel}>Total Gravámenes a Pagar:</Text>
              <Text style={styles.calcTotalValue}>
                USD ${totalImpuestosCalculado.toLocaleString()}
              </Text>
            </View>
          </Card>
        )}

        {/* Subida de Documentos */}
        <Card variant="default" style={styles.formCard}>
          <Text style={styles.sectionHeaderTitle}>Documentos de Soporte</Text>
          <Text style={styles.sectionHeaderSub}>
            Adjunta la Factura Comercial, Conocimiento de Embarque (B/L) y Certificados.
          </Text>

          <FilePreview
            documentos={documentos}
            onRemove={handleRemoveDocument}
            readOnly={false}
          />

          <FileUpload
            onFileSelected={handleAddDocument}
            uploadedBy={user?.name || 'Importador'}
          />
        </Card>

        {/* Botón de Envío */}
        <Button
          title="Crear y Registrar Expediente"
          size="large"
          variant="primary"
          loading={isSubmitting}
          onPress={handleSubmit}
          fullWidth
          style={styles.submitBtn}
        />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Animation Modal */}
      <SuccessModal
        visible={successVisible}
        type="expediente"
        detail={createdNumero ? `Expediente ${createdNumero} registrado en DGA` : undefined}
        onClose={() => {
          setSuccessVisible(false);
          router.replace('/(tabs)/expedientes');
        }}
        onAction={() => {
          setSuccessVisible(false);
          router.replace('/(tabs)/expedientes');
        }}
        actionLabel="Ver Expedientes"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  formCard: {
    padding: 16,
    marginVertical: 0,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionHeaderSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 70,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  colInput: {
    flex: 1,
  },
  calcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  calcTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calcLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  calcValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  calcDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  calcTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  calcTotalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  submitBtn: {
    marginTop: 8,
  },
});
