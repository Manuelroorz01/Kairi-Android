import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppScreen } from '@/components/AppScreen';
import { COLOR_COMMANDS } from '@/constants/commands';
import { useBluetooth } from '@/contexts/BluetoothContext';
import { useColors } from '@/hooks/useColors';

export default function ControlScreen() {
  const colors = useColors();
  const { connectedDevice, error, lastCommand, sendCommand, clearError } = useBluetooth();

  const send = async (character: '1' | '2' | '3' | '4' | '5' | '6' | '7') => {
    clearError();
    await sendCommand(character);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <AppScreen>
      <View style={styles.topLine}>
        <View style={styles.heading}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>CONTROL REMOTO</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Luces RGB</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Elige un color para iluminar a Kairi.
          </Text>
        </View>
        <Image source={require('../../assets/images/icon.png')} style={styles.icon} />
      </View>

      <View style={[styles.connectionPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.statusDot, { backgroundColor: connectedDevice ? '#42D392' : colors.mutedForeground }]} />
        <Text style={[styles.connectionText, { color: colors.mutedForeground }]}>
          {connectedDevice ? `Conectado a ${connectedDevice.name}` : 'Conecta el robot desde la pestaña Conexión'}
        </Text>
      </View>

      <View style={styles.grid}>
        {COLOR_COMMANDS.map((command) => (
          <Pressable
            key={command.character}
            testID={`command-${command.character}`}
            accessibilityRole="button"
            accessibilityLabel={`Enviar color ${command.label}, comando ${command.character}`}
            disabled={!connectedDevice}
            onPress={() => void send(command.character)}
            style={({ pressed }) => [
              styles.colorButton,
              {
                backgroundColor: command.color,
                opacity: !connectedDevice ? 0.45 : pressed ? 0.78 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={[styles.commandNumber, { borderColor: command.ink }]}>
              <Text style={[styles.commandNumberText, { color: command.ink }]}>{command.character}</Text>
            </View>
            <Text style={[styles.colorLabel, { color: command.ink }]}>{command.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        testID="command-7"
        accessibilityRole="button"
        accessibilityLabel="Apagar las luces"
        disabled={!connectedDevice}
        onPress={() => void send('7')}
        style={({ pressed }) => [
          styles.offButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
            opacity: !connectedDevice ? 0.48 : pressed ? 0.82 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
      >
        <View style={[styles.offIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="power" size={21} color={colors.primaryForeground} />
        </View>
        <View style={styles.offCopy}>
          <Text style={[styles.offTitle, { color: colors.foreground }]}>APAGAR</Text>
          <Text style={[styles.offSubtitle, { color: colors.mutedForeground }]}>Comando 7</Text>
        </View>
        <Ionicons name="arrow-forward" size={19} color={colors.primary} />
      </Pressable>

      {lastCommand && (
        <View style={[styles.lastCommand, { backgroundColor: colors.muted }]}>
          <Ionicons name="checkmark-circle" size={17} color="#42D392" />
          <Text style={[styles.lastCommandText, { color: colors.mutedForeground }]}>
            Último comando enviado: {lastCommand}
          </Text>
        </View>
      )}

      {error && (
        <View style={[styles.errorBox, { backgroundColor: '#351E2A', borderColor: '#6D3346' }]}>
          <Ionicons name="alert-circle-outline" size={18} color="#FF8792" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 20 },
  heading: { flex: 1, paddingRight: 12 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2.2, marginBottom: 5 },
  title: { fontSize: 29, fontWeight: '800', letterSpacing: 0.2 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  icon: { width: 58, height: 58, borderRadius: 16 },
  connectionPill: { borderWidth: 1, borderRadius: 13, minHeight: 42, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  connectionText: { fontSize: 11, flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  colorButton: { width: '48.2%', minHeight: 103, borderRadius: 19, padding: 14, justifyContent: 'space-between' },
  commandNumber: { width: 28, height: 28, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  commandNumberText: { fontSize: 12, fontWeight: '800' },
  colorLabel: { fontSize: 16, fontWeight: '800' },
  offButton: { minHeight: 74, borderWidth: 1, borderRadius: 19, paddingHorizontal: 15, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  offIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  offCopy: { flex: 1 },
  offTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 1.3 },
  offSubtitle: { fontSize: 11, marginTop: 3 },
  lastCommand: { marginTop: 14, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  lastCommandText: { fontSize: 11 },
  errorBox: { borderWidth: 1, borderRadius: 13, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 13 },
  errorText: { color: '#FFD7DA', fontSize: 12, lineHeight: 18, flex: 1 },
});
