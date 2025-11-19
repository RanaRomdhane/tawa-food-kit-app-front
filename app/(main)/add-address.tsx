import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Address } from '@/types';

export default function AddAddress() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { addAddress, updateAddress, addresses } = useApp();
  
  // Check if we're editing an existing address
  const editId = params.id as string | undefined;
  const existingAddress = addresses.find(a => a.id === editId);

  const [address, setAddress] = useState('');
  const [street, setStreet] = useState('');
  const [postCode, setPostCode] = useState('');
  const [apartment, setApartment] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<'Home' | 'School' | 'Other'>('Home');

  // Load existing address data if editing
  useEffect(() => {
    if (existingAddress) {
      setAddress(existingAddress.fullAddress);
      setStreet(existingAddress.street);
      setPostCode(existingAddress.postCode);
      setApartment(existingAddress.apartment);
      setSelectedLabel(existingAddress.label);
    }
  }, [existingAddress]);

  const handleSave = async () => {
    if (!address.trim() || !street.trim() || !postCode.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editId && existingAddress) {
        // Update existing address
        await updateAddress(editId, {
          label: selectedLabel,
          fullAddress: address,
          street,
          postCode,
          apartment,
          id: editId,
        });
        Alert.alert('Success', 'Address updated successfully');
      } else {
        // Add new address
        await addAddress({
          label: selectedLabel,
          fullAddress: address,
          street,
          postCode,
          apartment,
        });
        Alert.alert('Success', 'Address added successfully');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save address');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editId ? 'Edit Address' : 'Add Address'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.map}>
          <View style={styles.mapPin}>
            <MapPin size={32} color={colors.primary} fill={colors.primary} />
          </View>
          <View style={styles.mapTooltip}>
            <Text style={styles.mapTooltipText}>Move to edit location</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ADDRESS *</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={colors.mediumGray} />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter full address"
                placeholderTextColor={colors.mediumGray}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>STREET *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={street}
                  onChangeText={setStreet}
                  placeholder="Street name"
                  placeholderTextColor={colors.mediumGray}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>POST CODE *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={postCode}
                  onChangeText={setPostCode}
                  keyboardType="numeric"
                  placeholder="Post code"
                  placeholderTextColor={colors.mediumGray}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>APARTMENT</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={apartment}
                onChangeText={setApartment}
                placeholder="Apartment number"
                placeholderTextColor={colors.mediumGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LABEL AS</Text>
            <View style={styles.labelOptions}>
              <TouchableOpacity
                style={[
                  styles.labelOption,
                  selectedLabel === 'Home' && styles.labelOptionActive,
                ]}
                onPress={() => setSelectedLabel('Home')}
              >
                <Text
                  style={[
                    styles.labelOptionText,
                    selectedLabel === 'Home' && styles.labelOptionTextActive,
                  ]}
                >
                  Home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.labelOption,
                  selectedLabel === 'School' && styles.labelOptionActive,
                ]}
                onPress={() => setSelectedLabel('School')}
              >
                <Text
                  style={[
                    styles.labelOptionText,
                    selectedLabel === 'School' && styles.labelOptionTextActive,
                  ]}
                >
                  School
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.labelOption,
                  selectedLabel === 'Other' && styles.labelOptionActive,
                ]}
                onPress={() => setSelectedLabel('Other')}
              >
                <Text
                  style={[
                    styles.labelOptionText,
                    selectedLabel === 'Other' && styles.labelOptionTextActive,
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {editId ? 'UPDATE LOCATION' : 'SAVE LOCATION'}
            </Text>
          </TouchableOpacity>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 300,
    backgroundColor: colors.mapBackground,
  },
  map: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -16,
  },
  mapTooltip: {
    position: 'absolute',
    top: 24,
    backgroundColor: colors.darkNavy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapTooltipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.textDark,
  },
  row: {
    flexDirection: 'row',
  },
  labelOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  labelOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
  },
  labelOptionActive: {
    backgroundColor: colors.primary,
  },
  labelOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
  },
  labelOptionTextActive: {
    color: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
    letterSpacing: 0.5,
  },
});