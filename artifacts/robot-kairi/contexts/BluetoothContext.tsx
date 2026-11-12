import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  PermissionsAndroid,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import RNBluetoothClassic, {
  type BluetoothDevice,
} from 'react-native-bluetooth-classic';
import type { KairiCommand } from '@/constants/commands';

type BluetoothContextValue = {
  devices: BluetoothDevice[];
  selectedAddress: string | null;
  connectedDevice: BluetoothDevice | null;
  isDiscovering: boolean;
  isConnecting: boolean;
  needsSettings: boolean;
  error: string | null;
  lastCommand: KairiCommand | null;
  selectDevice: (address: string) => void;
  discoverDevices: () => Promise<void>;
  connectSelectedDevice: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (character: KairiCommand) => Promise<void>;
  clearError: () => void;
};

const BluetoothContext = createContext<BluetoothContextValue | null>(null);

function uniqueByAddress(devices: BluetoothDevice[]) {
  const byAddress = new Map<string, BluetoothDevice>();
  devices.forEach((device) => byAddress.set(device.address, device));
  return Array.from(byAddress.values()).sort((left, right) => {
    const leftIsKairi = left.name?.toLowerCase().includes('kairi') ? 1 : 0;
    const rightIsKairi = right.name?.toLowerCase().includes('kairi') ? 1 : 0;
    return rightIsKairi - leftIsKairi || (left.name ?? '').localeCompare(right.name ?? '');
  });
}

export function BluetoothProvider({ children }: React.PropsWithChildren) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [needsSettings, setNeedsSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<KairiCommand | null>(null);
  const connectedAddress = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = RNBluetoothClassic.onDeviceDisconnected((event) => {
      if (event.device?.address === connectedAddress.current) {
        connectedAddress.current = null;
        setConnectedDevice(null);
      }
    });

    return () => subscription.remove();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const selectDevice = useCallback((address: string) => {
    setSelectedAddress(address);
    setError(null);
  }, []);

  const requestAndroidPermissions = useCallback(async () => {
    setNeedsSettings(false);
    if (Platform.OS !== 'android') {
      setError('La conexión con el Robot Kairi requiere Android y Bluetooth clásico.');
      return false;
    }

    const location = await Location.requestForegroundPermissionsAsync();
    if (!location.granted) {
      setNeedsSettings(!location.canAskAgain);
      setError('Permite el acceso a la ubicación para buscar dispositivos Bluetooth cercanos.');
      return false;
    }

    const bluetoothPermissions =
      Platform.Version >= 31
        ? [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]
        : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

    const results = await PermissionsAndroid.requestMultiple(bluetoothPermissions);
    const allGranted = Object.values(results).every(
      (result) => result === PermissionsAndroid.RESULTS.GRANTED,
    );
    if (!allGranted) {
      setNeedsSettings(Object.values(results).includes(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN));
      setError('Se necesitan los permisos de Bluetooth para encontrar y conectar el robot.');
      return false;
    }
    return true;
  }, []);

  const discoverDevices = useCallback(async () => {
    setError(null);
    if (Platform.OS !== 'android') {
      setError('La búsqueda Bluetooth clásico para el ESP32 está disponible en Android.');
      return;
    }

    setIsDiscovering(true);
    try {
      const permitted = await requestAndroidPermissions();
      if (!permitted) return;

      const available = await RNBluetoothClassic.isBluetoothAvailable();
      if (!available) {
        setError('Este dispositivo no tiene Bluetooth disponible.');
        return;
      }

      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        const turnedOn = await RNBluetoothClassic.requestBluetoothEnabled();
        if (!turnedOn) {
          setError('Activa Bluetooth para buscar el Robot Kairi.');
          return;
        }
      }

      const [paired, nearby] = await Promise.all([
        RNBluetoothClassic.getBondedDevices(),
        RNBluetoothClassic.startDiscovery(),
      ]);
      const found = uniqueByAddress([...paired, ...nearby]);
      setDevices(found);

      const kairi = found.find((device) => device.name?.toLowerCase().includes('kairi'));
      const nextAddress = kairi?.address ?? found[0]?.address ?? null;
      setSelectedAddress(nextAddress);
      if (found.length === 0) {
        setError('No se encontraron dispositivos. Enciende el robot e inténtalo de nuevo.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo buscar dispositivos Bluetooth.');
    } finally {
      setIsDiscovering(false);
    }
  }, [requestAndroidPermissions]);

  const connectSelectedDevice = useCallback(async () => {
    setError(null);
    if (Platform.OS !== 'android') {
      setError('La conexión con el ESP32 por Bluetooth clásico requiere Android.');
      return;
    }

    const target = devices.find((device) => device.address === selectedAddress);
    if (!target) {
      setError('Selecciona primero un dispositivo Bluetooth.');
      return;
    }

    setIsConnecting(true);
    try {
      const permitted = await requestAndroidPermissions();
      if (!permitted) return;

      const connected = await target.connect({
        connectorType: 'rfcomm',
        connectionType: 'delimited',
        delimiter: '',
        charset: 'utf-8',
        secureSocket: true,
      });
      if (!connected) {
        setError('No se pudo establecer la conexión. Verifica que el robot esté encendido.');
        return;
      }

      connectedAddress.current = target.address;
      setConnectedDevice(target);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo conectar con el robot.');
    } finally {
      setIsConnecting(false);
    }
  }, [devices, requestAndroidPermissions, selectedAddress]);

  const disconnect = useCallback(async () => {
    setError(null);
    if (!connectedDevice) return;

    try {
      await connectedDevice.disconnect();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cerrar la conexión Bluetooth.');
    } finally {
      connectedAddress.current = null;
      setConnectedDevice(null);
      setLastCommand(null);
    }
  }, [connectedDevice]);

  const sendCommand = useCallback(
    async (character: KairiCommand) => {
      setError(null);
      if (!connectedDevice) {
        setError('Conecta el robot antes de enviar comandos.');
        return;
      }

      if (!['1', '2', '3', '4', '5', '6', '7'].includes(character)) {
        setError('Comando no permitido.');
        return;
      }

      try {
        // Send one UTF-8 character only: no newline, delimiter, or extra payload.
        await connectedDevice.write(character, 'utf-8');
        setLastCommand(character);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudo enviar el comando.');
      }
    },
    [connectedDevice],
  );

  const value = useMemo(
    () => ({
      devices,
      selectedAddress,
      connectedDevice,
      isDiscovering,
      isConnecting,
      needsSettings,
      error,
      lastCommand,
      selectDevice,
      discoverDevices,
      connectSelectedDevice,
      disconnect,
      sendCommand,
      clearError,
    }),
    [
      devices,
      selectedAddress,
      connectedDevice,
      isDiscovering,
      isConnecting,
      needsSettings,
      error,
      lastCommand,
      selectDevice,
      discoverDevices,
      connectSelectedDevice,
      disconnect,
      sendCommand,
      clearError,
    ],
  );

  return <BluetoothContext.Provider value={value}>{children}</BluetoothContext.Provider>;
}

export function useBluetooth() {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error('useBluetooth debe usarse dentro de BluetoothProvider.');
  }
  return context;
}
