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
import { 
  ChevronLeft, 
  User as UserIcon, 
  MapPin, 
  ShoppingBag, 
  Heart, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  MessageCircle,
  LogOut
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as never);
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: UserIcon, label: 'Personal Info', route: '/profile/personal-info' },
    { icon: MapPin, label: 'Addresses', route: '/my-address' },
    { icon: ShoppingBag, label: 'Cart', route: '/cart' },
    { icon: Heart, label: 'Favourite', route: '/profile/favorites' },
    { icon: Bell, label: 'Notifications', route: '/profile/notifications' },
    { icon: CreditCard, label: 'My orders', route: '/my-orders' },
    { icon: HelpCircle, label: 'FAQs', route: '/profile/faqs' },
    { icon: MessageCircle, label: 'User Reviews', route: '/profile/reviews' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
            style={styles.avatar}
            contentFit="cover"
          />
          <Text style={styles.name}>{user?.name || 'Rana Romdhane'}</Text>
          <Text style={styles.bio}>{user?.bio || 'I love fast food'}</Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.slice(0, 3).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as never)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: colors.primary + '15' }]}>
                  <item.icon size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          {menuItems.slice(3).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as never)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: getIconColor(index) }]}>
                  <item.icon size={20} color={getIconColorDark(index)} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#EF444415' }]}>
                <LogOut size={20} color="#EF4444" />
              </View>
              <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Logout</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function getIconColor(index: number) {
  const colors_list = ['#FF6B6B15', '#FFA50015', '#4ECDC415', '#9B59B615', '#3498DB15'];
  return colors_list[index % colors_list.length];
}

function getIconColorDark(index: number) {
  const colors_list = ['#FF6B6B', '#FFA500', '#4ECDC4', '#9B59B6', '#3498DB'];
  return colors_list[index % colors_list.length];
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: colors.textLight,
  },
  menuSection: {
    backgroundColor: colors.lightGray,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: colors.textDark,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.textLight,
  },
});