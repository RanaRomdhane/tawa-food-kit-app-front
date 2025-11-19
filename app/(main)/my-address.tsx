import { useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Home, Briefcase, Edit2, Trash2, MapPin } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function MyAddress() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addresses, deleteAddress } = useApp();

  const getIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home size={24} color={colors.blue} />;
      case 'School':
        return <Briefcase size={24} color={colors.purple} />;
      default:
        return <MapPin size={24} color={colors.textLight} />;
    }
  };

  const handleDelete = (id: string, label: string) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete this ${label} address?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(id);
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (id: string) => {
    router.push({
      pathname: '/add-address',
      params: { id }
    } as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.iconContainer}>
              {getIcon(address.label)}
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>{address.label.toUpperCase()}</Text>
              <Text style={styles.addressText}>{address.fullAddress}</Text>
              <Text style={styles.addressDetails}>
                {address.street}, {address.postCode}
                {address.apartment ? `, Apt ${address.apartment}` : ''}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(address.id)}
              >
                <Edit2 size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(address.id, address.label)}
              >
                <Trash2 size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {addresses.length === 0 && (
          <View style={styles.emptyContainer}>
            <MapPin size={64} color={colors.lightGray} />
            <Text style={styles.emptyText}>No addresses saved</Text>
            <Text style={styles.emptySubtext}>Add your first delivery address</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-address' as never)}
        >
          <Text style={styles.addButtonText}>ADD NEW ADDRESS</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: colors.lightBlue,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 2,
    fontWeight: '600' as const,
  },
  addressDetails: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
    letterSpacing: 0.5,
  },
});