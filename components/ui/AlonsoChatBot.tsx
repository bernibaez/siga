import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import {
  Bot,
  X,
  Send,
  Sparkles,
  HelpCircle,
  FileText,
  DollarSign,
  Layers,
  ArrowRight,
  User,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '@/theme/colors';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from '@/types';

export const AlonsoChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
  const { expedientes, pagos, igeas, igras, cargas } = useData();
  const { user, isImportador } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // Inicializar mensaje de bienvenida de Alonso
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome-1',
          sender: 'alonso',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `¡Hola ${user?.name || 'colega'}! Soy **Alonso**, tu asistente aduanero inteligente en SIGA República Dominicana.\n\n¿En qué puedo ayudarte hoy con tus expedientes, tributos o trámites de despacho?`,
          quickActions: [
            { label: '📊 Resumen de mis trámites', actionType: 'query', payload: 'resumen general' },
            { label: '💳 ¿Cuánto tengo pendiente de pago?', actionType: 'query', payload: 'pagos pendientes' },
            { label: '📦 ¿Qué es IGEA e IGRA?', actionType: 'query', payload: 'que es igea e igra' },
            { label: '📝 ¿Cómo registro un expediente?', actionType: 'query', payload: 'como crear expediente' },
          ],
        },
      ]);
    }
  }, [user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const generateAlonsoResponse = (query: string): { text: string; quickActions?: ChatMessage['quickActions'] } => {
    const q = query.toLowerCase().trim();

    // 1. Resumen general / Estado de expedientes
    if (q.includes('resumen') || q.includes('mis trámites') || q.includes('estado general') || q.includes('cuantos expedientes') || q.includes('cuántos expedientes')) {
      const total = expedientes.length;
      const pendientes = expedientes.filter((e) => e.estado === 'pendiente').length;
      const revision = expedientes.filter((e) => e.estado === 'revision').length;
      const pagados = expedientes.filter((e) => e.estado === 'pagado').length;
      const valorTotalCif = expedientes.reduce((acc, curr) => acc + curr.valorCIF, 0);

      return {
        text: `Aquí tienes el estado actual de tus expedientes en SIGA:\n\n• **Total de expedientes:** ${total}\n• **Pendientes:** ${pendientes}\n• **En Revisión / Aforo:** ${revision}\n• **Pagados / Listos:** ${pagados}\n• **Valor CIF acumulado:** USD $${valorTotalCif.toLocaleString()}\n\n¿Deseas inspeccionar algún expediente en particular?`,
        quickActions: [
          { label: '📂 Ver Expedientes', actionType: 'navigate', payload: '/(tabs)/expedientes' },
          { label: '💳 Ver Pagos', actionType: 'navigate', payload: '/(tabs)/pagos' },
        ],
      };
    }

    // 2. Preguntas sobre Pagos / Tributos
    if (q.includes('pago') || q.includes('pagar') || q.includes('impuesto') || q.includes('itbis') || q.includes('arancel') || q.includes('debo')) {
      const pagosPendientes = pagos.filter((p) => p.estado !== 'pagado');
      const totalDeuda = pagosPendientes.reduce((acc, p) => acc + (p.montoTotal - p.monto), 0);

      if (pagosPendientes.length === 0) {
        return {
          text: `¡Excelentes noticias! No tienes pagos pendientes en este momento. Todas tus declaraciones están al día con la Dirección General de Aduanas (DGA).`,
        };
      }

      return {
        text: `Tienes **${pagosPendientes.length} pago(s) pendiente(s)** por un total adeudado de **USD $${totalDeuda.toLocaleString()}**.\n\nLos tributos incluyen:\n• **ITBIS aduanero (18%)**\n• **Arancel aduanero (según partida)**\n• **Impuesto Selectivo al Consumo (si aplica)**\n\nPuedes liquidarlos directamente en el módulo de Pagos.`,
        quickActions: [
          { label: '💳 Ir a Pagar', actionType: 'navigate', payload: '/(tabs)/pagos' },
          { label: '📄 Detalle de impuestos', actionType: 'query', payload: 'como se calculan los impuestos' },
        ],
      };
    }

    // 3. IGEA e IGRA
    if (q.includes('igea') || q.includes('igra') || q.includes('entrada') || q.includes('retiro') || q.includes('modulo')) {
      return {
        text: `Te explico los módulos aduaneros de la DGA:\n\n🔹 **IGEA (Informe de Gestión de Entrada Aduanera):** Registra el ingreso formal de la mercancía al puerto o aeropuerto dominicano (Manifiesto de carga, descarga y recepción en patio).\n\n🔹 **IGRA (Informe de Gestión de Retiro Aduanero):** Es la autorización final emitida tras la validación de aforo y pago de gravámenes, que permite retirar físicamente el contenedor del recinto fiscal.`,
        quickActions: [
          { label: '📑 Ver Módulos IGEA/IGRA', actionType: 'navigate', payload: '/(tabs)/modulos' },
        ],
      };
    }

    // 4. Creación de expedientes
    if (q.includes('crear') || q.includes('nuevo expediente') || q.includes('como registrar') || q.includes('cómo crear') || q.includes('subir')) {
      return {
        text: `Para registrar un nuevo expediente en SIGA:\n\n1. Ve a la pestaña **Expedientes**.\n2. Toca el botón **"Nuevo Expediente"** (+).\n3. Ingresa el Número de Declaración, Mercancía, Valor FOB, CIF y Peso (kg).\n4. El sistema calculará automáticamente el ITBIS (18%) y aranceles.\n5. Adjunta tus archivos de soporte (Factura comercial, B/L, Certificado de Origen) en PDF o imagen de hasta 10MB.\n6. Presiona **"Crear Expediente"** para enviar a DGA.`,
        quickActions: isImportador
          ? [{ label: '➕ Crear Expediente Ahora', actionType: 'navigate', payload: '/expedientes/nuevo' }]
          : [],
      };
    }

    // 5. Carga y Contenedores
    if (q.includes('carga') || q.includes('contenedor') || q.includes('bl') || q.includes('caucedo') || q.includes('haina')) {
      const retenidas = cargas.filter((c) => c.estado === 'retenida').length;
      const proceso = cargas.filter((c) => c.estado === 'proceso').length;
      const listas = cargas.filter((c) => c.estado === 'lista').length;

      return {
        text: `Estado del seguimiento de tus cargas:\n\n• **Listas para retiro:** ${listas}\n• **En proceso en patio:** ${proceso}\n• **Retenidas por aforo:** ${retenidas}\n\nLos recintos monitoreados incluyen Puerto Multimodal Caucedo, Río Haina Oriental y AILA.`,
        quickActions: [
          { label: '🔍 Ir al Buscador', actionType: 'navigate', payload: '/(tabs)/buscador' },
        ],
      };
    }

    // 6. Cálculo de impuestos
    if (q.includes('calcular') || q.includes('formula') || q.includes('fórmula') || q.includes('gravamen')) {
      return {
        text: `En Aduanas República Dominicana los gravámenes se liquidan sobre la base imponible del valor **CIF** (Costo + Seguro + Flete):\n\n1. **Arancel (Gravamen):** Generalmente 0%, 3%, 8%, 14% o 20% del valor CIF.\n2. **Selectivo al Consumo:** Aplicable a mercancías específicas (vehículos, alcohol, tabaco).\n3. **ITBIS:** 18% aplicado sobre (Valor CIF + Arancel + Selectivo).`,
      };
    }

    // 7. Roles y ayuda general
    return {
      text: `Entiendo tu consulta sobre "${query}". Como asistente de SIGA puedo ayudarte a consultar expedientes, liquidación de aranceles, estados de carga IGEA/IGRA y soporte de la DGA.\n\n¿Deseas que te muestre alguna de estas opciones rápidas?`,
      quickActions: [
        { label: '📊 Resumen General', actionType: 'query', payload: 'resumen general' },
        { label: '💳 Ver Pagos', actionType: 'query', payload: 'pagos pendientes' },
        { label: '📦 ¿Qué es IGEA e IGRA?', actionType: 'query', payload: 'que es igea e igra' },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    setTimeout(() => {
      const responseData = generateAlonsoResponse(query);
      const botMessage: ChatMessage = {
        id: `alonso-${Date.now()}`,
        sender: 'alonso',
        text: responseData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: responseData.quickActions,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      scrollToBottom();
    }, 500);
  };

  const handleActionPress = (action: { label: string; actionType: 'navigate' | 'query' | 'help'; payload: string }) => {
    if (action.actionType === 'navigate') {
      setIsOpen(false);
      router.push(action.payload as any);
    } else if (action.actionType === 'query') {
      handleSendMessage(action.payload);
    }
  };

  return (
    <>
      {/* Botón Flotante de Alonso en la esquina inferior */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        activeOpacity={0.85}
        style={styles.floatingButton}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingGradient}
        >
          <Bot size={26} color={COLORS.white} />
          <View style={styles.onlineBadge} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal Interactivo de Chat */}
      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={() => setIsOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.chatContainer}>
            {/* Header del Chat */}
            <LinearGradient
              colors={[COLORS.primaryDark, COLORS.accentNavy]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chatHeader}
            >
              <View style={styles.headerLeft}>
                <View style={styles.alonsoAvatar}>
                  <Bot size={22} color={COLORS.white} />
                  <View style={styles.avatarOnlineDot} />
                </View>
                <View>
                  <View style={styles.headerTitleRow}>
                    <Text style={styles.headerTitle}>Alonso AI</Text>
                    <View style={styles.officialBadge}>
                      <Text style={styles.officialText}>DGA SIGA</Text>
                    </View>
                  </View>
                  <Text style={styles.headerSubtitle}>Asistente Virtual Aduanero</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeButton}
              >
                <X size={20} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Cuerpo de Mensajes */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesBody}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => {
                const isAlonso = msg.sender === 'alonso';
                return (
                  <View
                    key={msg.id}
                    style={[styles.messageWrapper, isAlonso ? styles.alonsoWrapper : styles.userWrapper]}
                  >
                    {isAlonso && (
                      <View style={styles.msgAvatar}>
                        <Bot size={16} color={COLORS.primaryDark} />
                      </View>
                    )}

                    <View style={[styles.bubble, isAlonso ? styles.alonsoBubble : styles.userBubble]}>
                      <Text style={[styles.messageText, isAlonso ? styles.alonsoText : styles.userText]}>
                        {msg.text}
                      </Text>
                      <Text style={[styles.timeText, isAlonso ? styles.alonsoTime : styles.userTime]}>
                        {msg.timestamp}
                      </Text>

                      {/* Botones de acción rápida dentro del mensaje */}
                      {msg.quickActions && msg.quickActions.length > 0 && (
                        <View style={styles.actionsContainer}>
                          {msg.quickActions.map((action, idx) => (
                            <TouchableOpacity
                              key={idx}
                              onPress={() => handleActionPress(action)}
                              activeOpacity={0.75}
                              style={styles.actionChip}
                            >
                              <Text style={styles.actionChipText}>{action.label}</Text>
                              <ArrowRight size={12} color={COLORS.primaryDark} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}

              {isTyping && (
                <View style={[styles.messageWrapper, styles.alonsoWrapper]}>
                  <View style={styles.msgAvatar}>
                    <Bot size={16} color={COLORS.primaryDark} />
                  </View>
                  <View style={[styles.bubble, styles.alonsoBubble, styles.typingBubble]}>
                    <Text style={styles.typingText}>Alonso está respondiendo...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input del Chat */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.chatInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Escribe una pregunta sobre tus trámites..."
                placeholderTextColor={COLORS.textMuted}
                onSubmitEditing={() => handleSendMessage()}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim()}
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              >
                <Send size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 102 : 82,
    right: 16,
    zIndex: 999,
    elevation: 8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  floatingGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  onlineBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00E676',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alonsoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E676',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginRight: 6,
  },
  officialBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  officialText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesBody: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '86%',
  },
  alonsoWrapper: {
    alignSelf: 'flex-start',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  alonsoBubble: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userBubble: {
    backgroundColor: COLORS.primaryDark,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  alonsoText: {
    color: COLORS.textPrimary,
  },
  userText: {
    color: COLORS.white,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  alonsoTime: {
    color: COLORS.textMuted,
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  actionsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceSubtle,
    gap: 6,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginRight: 6,
  },
  typingBubble: {
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chatInput: {
    flex: 1,
    height: 42,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.neutral,
    opacity: 0.5,
  },
});
