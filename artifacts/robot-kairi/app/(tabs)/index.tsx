import React from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { useBluetooth } from '@/contexts/BluetoothContext';
import { useColors } from '@/hooks/useColors';

export default function ConnectionScreen() {
  const colors = useColors();
  const {
    devices,
    selectedAddress,
    connectedDevice,
    isDiscovering,
    isConnecting,
    needsSettings,
    error,
    selectDevice,
    discoverDevices,
    connectSelectedDevice,
    disconnect,
    clearError,
  } = useBluetooth();

  const selectedDevice = devices.find((device) => device.address === selectedAddress);
  const unsupportedPlatform = Platform.OS !== 'android';

  return (
    <AppScreen>
      <View style={styles.brandRow}>
        <Image source={require('../../assets/images/logo.jpeg')} style={styles.logo} />
        <View style={styles.brandCopy}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>ROXAS ROBOTICS</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>ROBOT KAIRI</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Control de iluminación Bluetooth</Text>
        </View>
      </View>

      <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statusLeft}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: connectedDevice ? '#42D392' : colors.mutedForeground },
            ]}
          />
          <View>
            <Text style={[styles.statusTitle, { color: colors.foreground }]}>
              {connectedDevice ? 'Conectado' : 'Desconectado'}
            </Text>
            <Text style={[styles.statusDetail, { color: colors.mutedForeground }]}>
              {connectedDevice?.name ?? 'Sin robot conectado'}
            </Text>
          </View>
        </View>
        <Ionicons
          name={connectedDevice ? 'bluetooth' : 'bluetooth-outline'}
          size={24}
          color={connectedDevice ? '#42D392' : colors.mutedForeground}
        />
      </View>

      {unsupportedPlatform && (
        <View style={[styles.notice, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="phone-portrait-outline" size={19} color={colors.primary} />
          <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
            Para conectar con el ESP32 necesitas un dispositivo Android y una compilación nativa de la app.
          </Text>
        </View>
      )}

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Dispositivos cercanos</Text>
        <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>
          Enciende Kairi antes de iniciar la búsqueda.
        </Text>
      </View>

      <Pressable
        testID="discover-devices"
        accessibilityRole="button"
        accessibilityLabel="Buscar dispositivos Bluetooth"
        disabled={isDiscovering || unsupportedPlatform}
        onPress={() => {
          clearError();
          void discoverDevices();
        }}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: colors.primary, opacity: isDiscovering || unsupportedPlatform ? 0.58 : pressed ? 0.84 : 1 },
        ]}
      >
        {isDiscovering ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Ionicons name="search" size={19} color={colors.primaryForeground} />
        )}
        <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
          {isDiscovering ? 'Buscando…' : 'Buscar dispositivos'}
        </Text>
      </Pressable>

      {devices.length > 0 ? (
        <View style={styles.deviceList}>
          {devices.map((device) => {
            const isSelected = device.address === selectedAddress;
            const isKairi = device.name?.toLowerCase().includes('kairi');
            return (
              <Pressable
                key={device.address}
                testID={`device-${device.address}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => selectDevice(device.address)}
                style={({ pressed }) => [
                  styles.deviceCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={[styles.deviceIcon, { backgroundColor: colors.muted }]}>
                  <Ionicons name="bluetooth" size={20} color={isSelected ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={styles.deviceDetails}>
                  <View style={styles.deviceNameRow}>
                    <Text style={[styles.deviceName, { color: colors.foreground }]}>
                      {device.name || 'Dispositivo sin nombre'}
                    </Text>
                    {isKairi && (
                      <View style={[styles.kairiTag, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.kairiTagText, { color: colors.primaryForeground }]}>KAIRI</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.deviceAddress, { color: colors.mutedForeground }]}>
                    {device.bonded ? 'Vinculado' : 'Bluetooth clásico'}
                  </Text>
                </View>
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={21}
                  color={isSelected ? colors.primary : colors.mutedForeground}
                />
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={[styles.emptyState, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Ionicons name="bluetooth-outline" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Listo para buscar</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Los dispositivos encontrados aparecerán aquí. Busca el nombre Kairi en la lista.
          </Text>
        </View>
      )}

      {error && (
        <View style={[styles.errorBox, { backgroundColor: '#351E2A', borderColor: '#6D3346' }]}>
          <Ionicons name="alert-circle-outline" size={19} color="#FF8792" />
          <View style={styles.errorCopy}>
            <Text style={styles.errorText}>{error}</Text>
            {needsSettings && (
              <Pressable
                testID="open-settings"
                accessibilityRole="button"
                onPress={() => {
                  if (Platform.OS !== 'web') void Linking.openSettings().catch(() => undefined);
                }}
                style={styles.settingsButton}
              >
                <Text style={[styles.settingsButtonText, { color: colors.primary }]}>Abrir Ajustes</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {connectedDevice ? (
        <Pressable
          testID="disconnect"
          accessibilityRole="button"
          onPress={() => void disconnect()}
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Ionicons name="close-circle-outline" size={19} color={colors.foreground} />
          <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>Desconectar</Text>
        </Pressable>
      ) : (
        <Pressable
          testID="connect-device"
          accessibilityRole="button"
          disabled={!selectedDevice || isConnecting || unsupportedPlatform}
          onPress={() => void connectSelectedDevice()}
          style={({ pressed }) => [
            styles.connectButton,
            {
              borderColor: colors.primary,
              opacity: !selectedDevice || isConnecting || unsupportedPlatform ? 0.48 : pressed ? 0.76 : 1,
            },
          ]}
        >
          {isConnecting ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Ionicons name="link-outline" size={19} color={colors.primary} />
          )}
          <Text style={[styles.connectButtonText, { color: colors.primary }]}>
            {isConnecting ? 'Conectando…' : selectedDevice ? `Conectar a ${selectedDevice.name || 'dispositivo'}` : 'Selecciona un dispositivo'}
          </Text>
        </Pressable>
      )}

      <Text style={[styles.permissionNote, { color: colors.mutedForeground }]}>
        La ubicación se solicita únicamente para detectar dispositivos cercanos durante la búsqueda.
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 8, marginBottom: 24 },
  logo: { width: 64, height: 64, borderRadius: 16 },
  brandCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2.5, marginBottom: 3 },
  title: { fontSize: 25, lineHeight: 30, fontWeight: '800', letterSpacing: 0.8 },
  subtitle: { fontSize: 12, marginTop: 3 },
  statusCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusTitle: { fontSize: 15, fontWeight: '700' },
  statusDetail: { fontSize: 12, marginTop: 3 },
  notice: { borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: 'row', gap: 10, marginBottom: 20 },
  noticeText: { fontSize: 12, lineHeight: 18, flex: 1 },
  sectionHeading: { marginBottom: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionCaption: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  primaryButton: {
    minHeight: 53,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginBottom: 15,
  },
  primaryButtonText: { fontSize: 14, fontWeight: '800' },
  deviceList: { gap: 9, marginBottom: 13 },
  deviceCard: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
  },
  deviceIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  deviceDetails: { flex: 1 },
  deviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deviceName: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  kairiTag: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  kairiTagText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  deviceAddress: { fontSize: 11, marginTop: 3 },
  emptyState: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 20, paddingVertical: 21, alignItems: 'center', marginBottom: 13 },
  emptyIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  emptyTitle: { fontSize: 14, fontWeight: '700' },
  emptyText: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5, maxWidth: 260 },
  errorBox: { borderWidth: 1, borderRadius: 13, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 12 },
  errorText: { color: '#FFD7DA', fontSize: 12, lineHeight: 18, flex: 1 },
  errorCopy: { flex: 1 },
  settingsButton: { alignSelf: 'flex-start', paddingTop: 8 },
  settingsButtonText: { fontSize: 12, fontWeight: '800' },
  connectButton: { minHeight: 51, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  connectButtonText: { fontSize: 14, fontWeight: '700' },
  secondaryButton: { minHeight: 50, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  secondaryButtonText: { fontSize: 14, fontWeight: '700' },
  permissionNote: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 13, paddingHorizontal: 8 },
});
