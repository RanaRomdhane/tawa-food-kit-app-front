import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Address } from '@/types';

export default function AddAddress() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addAddress } = useApp();
  const [address, setAddress] = useState('Rue Des Entrepreneurs, Charguia2, Ariana');
  const [street, setStreet] = useState('Abu-Nawas');
  const [postCode, setPostCode] = useState('34567');
  const [apartment, setApartment] = useState('345');
  const [selectedLabel, setSelectedLabel] = useState<'Home' | 'School' | 'Other'>('School');

  const handleSave = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      label: selectedLabel,
      fullAddress: address,
      street,
      postCode,
      apartment,
    };
    addAddress(newAddress);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.white} />
        </TouchableOpacity>
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
            <Text style={styles.label}>ADDRESS</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={colors.mediumGray} />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholderTextColor={colors.mediumGray}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>STREET</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={street}
                  onChangeText={setStreet}
                  placeholderTextColor={colors.mediumGray}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>POST CODE</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={postCode}
                  onChangeText={setPostCode}
                  keyboardType="numeric"
                  placeholderTextColor={colors.mediumGray}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>APPARTMENT</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={apartment}
                onChangeText={setApartment}
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
            <Text style={styles.saveButtonText}>SAVE LOCATION</Text>
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
