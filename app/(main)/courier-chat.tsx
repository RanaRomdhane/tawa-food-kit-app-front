import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Smile } from 'lucide-react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

type Message = {
  id: string;
  text: string;
  isSent: boolean;
  time: string;
  isDelivered?: boolean;
};

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Are you coming?',
    isSent: true,
    time: '8:10 pm',
    isDelivered: true,
  },
  {
    id: '2',
    text: 'Hay, Congratulation for order',
    isSent: false,
    time: '8:11 pm',
  },
  {
    id: '3',
    text: 'Hey Where are you now?',
    isSent: true,
    time: '8:11 pm',
    isDelivered: true,
  },
  {
    id: '4',
    text: "I'm Coming , just wait ...",
    isSent: false,
    time: '8:12 pm',
  },
  {
    id: '5',
    text: 'Hurry Up, Man',
    isSent: true,
    time: '8:12 pm',
    isDelivered: false,
  },
];

export default function CourierChat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useApp();
  const [message, setMessage] = useState('');
  const [messages] = useState<Message[]>(mockMessages);

  const ongoingOrder = orders?.find((o) => o.status === 'ongoing' && o.courier);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ongoingOrder?.courier?.name || 'Ahmed Fadhel'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.messageRow, msg.isSent && styles.messageRowSent]}
          >
            {!msg.isSent && (
              <Image
                source={{ uri: ongoingOrder?.courier?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }}
                style={styles.avatar}
                contentFit="cover"
              />
            )}
            <View style={styles.messageGroup}>
              <View style={[styles.messageBubble, msg.isSent && styles.messageBubbleSent]}>
                <Text style={[styles.messageText, msg.isSent && styles.messageTextSent]}>
                  {msg.text}
                </Text>
              </View>
              <View style={[styles.messageTime, msg.isSent && styles.messageTimeSent]}>
                {msg.isSent && msg.isDelivered !== undefined && (
                  <Text style={styles.checkmark}>
                    {msg.isDelivered ? '✓✓' : '✓'}
                  </Text>
                )}
                <Text style={styles.timeText}>{msg.time}</Text>
              </View>
            </View>
            {msg.isSent && (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
                style={styles.avatar}
                contentFit="cover"
              />
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.emojiButton}>
          <Smile size={24} color={colors.mediumGray} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Write somethings"
          placeholderTextColor={colors.mediumGray}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Send size={20} color={colors.white} fill={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowSent: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  messageGroup: {
    flex: 1,
    maxWidth: '70%',
  },
  messageBubble: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  messageBubbleSent: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 20,
  },
  messageTextSent: {
    color: colors.white,
  },
  messageTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTimeSent: {
    justifyContent: 'flex-end',
  },
  timeText: {
    fontSize: 10,
    color: colors.mediumGray,
  },
  checkmark: {
    fontSize: 10,
    color: colors.mediumGray,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
    gap: 12,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textDark,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
