import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import colors from '@/constants/colors';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I place an order?',
    answer: 'Browse our menu, select your items, add them to cart, and proceed to checkout. Choose your delivery address and payment method to complete your order.',
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery, Visa, Mastercard, and PayPal. All online payments are secure and encrypted.',
  },
  {
    id: '3',
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 20-45 minutes depending on your location and the restaurant preparing your order. You can track your order in real-time.',
  },
  {
    id: '4',
    question: 'Can I modify my order after placing it?',
    answer: 'You can modify your order within 5 minutes of placing it by contacting our support. After that, the restaurant may have already started preparing it.',
  },
  {
    id: '5',
    question: 'What is your refund policy?',
    answer: 'If you\'re not satisfied with your order, please contact us within 24 hours. We offer full refunds for quality issues and partial refunds for minor concerns.',
  },
  {
    id: '6',
    question: 'How do I save my favorite items?',
    answer: 'Tap the heart icon on any item to add it to your favorites. You can access all your favorites from your profile page.',
  },
  {
    id: '7',
    question: 'Can I schedule orders for later?',
    answer: 'Yes! You can schedule orders up to 7 days in advance. Just select the date and time during checkout.',
  },
  {
    id: '8',
    question: 'How do I contact the delivery person?',
    answer: 'Once your order is out for delivery, you\'ll see call and chat buttons in the Track Order screen to contact your delivery partner.',
  },
];

export default function FAQs() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Find answers to commonly asked questions about our food delivery service
        </Text>

        <View style={styles.faqList}>
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                <Animated.View
                  style={[
                    styles.chevronIcon,
                    {
                      transform: [
                        {
                          rotate: expandedId === faq.id ? '180deg' : '0deg',
                        },
                      ],
                    },
                  ]}
                >
                  <ChevronDown size={20} color={colors.textLight} />
                </Animated.View>
              </TouchableOpacity>
              {expandedId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still have questions?</Text>
          <Text style={styles.contactText}>
            Contact our support team at support@tawafood.com or call us at +216 22 14 14 39
          </Text>
        </View>
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
  },
  intro: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  faqList: {
    paddingHorizontal: 20,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textDark,
    paddingRight: 12,
  },
  chevronIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  answerText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 22,
  },
  contactCard: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 20,
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});
