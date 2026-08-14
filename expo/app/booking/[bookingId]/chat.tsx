import { useLocalSearchParams, router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { BOOKINGS, getMessagesForBooking, getProviderById } from '@/data/mock';
import type { Message } from '@/types';
import { LogoutButton } from '@/components/LogoutButton';

export default function BookingChatScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = BOOKINGS.find(b => b.id === bookingId);
  const provider = booking ? getProviderById(booking.providerId) : undefined;
  const [messages, setMessages] = useState<Message[]>(() => booking ? getMessagesForBooking(booking.id) : []);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Booking not found</Text>
      </SafeAreaView>
    );
  }

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      bookingId: booking.id,
      senderId: 'user_me',
      senderName: 'You',
      senderRole: 'CUSTOMER',
      text: inputText.trim(),
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{booking.providerName}</Text>
          <Text style={styles.headerService}>{booking.serviceJobName}</Text>
        </View>
        <LogoutButton color={COLORS.white} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContainer}
        >
          <View style={styles.chatInfoBanner}>
            <Ionicons name="information-circle" size={16} color={COLORS.navy} />
            <Text style={styles.chatInfoText}>
              Messages are monitored for your safety. Share address & details here.
            </Text>
          </View>
          {messages.map(msg => {
            const isMe = msg.senderRole === 'CUSTOMER';
            return (
              <View key={msg.id} style={[styles.messageRow, isMe && styles.messageRowMe]}>
                <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleThem]}>
                  <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={!inputText.trim()}>
            <Ionicons name="send" size={20} color={inputText.trim() ? COLORS.white : COLORS.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navy,
    gap: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1, alignItems: 'center' },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerService: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  messagesContainer: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  chatInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.navy}08`,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chatInfoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
  },
  messageBubbleMe: {
    backgroundColor: COLORS.navy,
    borderBottomRightRadius: 4,
  },
  messageBubbleThem: {
    backgroundColor: COLORS.cardBg,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  messageTextMe: {
    color: COLORS.white,
  },
  messageTextThem: {
    color: COLORS.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.6)',
  },
  messageTimeThem: {
    color: COLORS.textTertiary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
