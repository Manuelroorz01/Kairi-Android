import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { useColors } from '@/hooks/useColors';

const SECTIONS = [
  { id: 'descripcion', label: 'Descripción', icon: 'information-circle-outline' },
  { id: 'componentes', label: 'Componentes', icon: 'hardware-chip-outline' },
  { id: 'caracteristicas', label: 'Características', icon: 'stats-chart-outline' },
  { id: 'cuidados', label: 'Cuidados', icon: 'shield-checkmark-outline' },
] as const;

type ManualSection = (typeof SECTIONS)[number]['id'];

export default function ManualScreen() {
  const colors = useColors();
  const [section, setSection] = useState<ManualSection>('descripcion');

  return (
    <AppScreen contentStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>GUÍA DEL ROBOT</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Manual</Text>
        </View>
        <Image source={require('../../assets/images/logo.jpeg')} style={styles.logo} />
      </View>

      <View style={[styles.tabRail, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SECTIONS.map((item) => {
          const active = section === item.id;
          return (
            <Pressable
              key={item.id}
              testID={`manual-${item.id}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setSection(item.id)}
              style={({ pressed }) => [
                styles.tab,
                { backgroundColor: active ? colors.primary : 'transparent', opacity: pressed ? 0.78 : 1 },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={active ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: active ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {section === 'descripcion' && (
        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.featureIcon, { backgroundColor: colors.muted }]}>
            <Ionicons name="sparkles-outline" size={21} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Conoce a Kairi</Text>
          <Text style={[styles.bodyCopy, { color: colors.mutedForeground }]}>
            El Robot Kairi es un dispositivo controlado manualmente por via bluetooth. Cuenta con iluminación LED RGB y un sistema de alimentación autónomo mediante una batería desmontable de 9 V. Su diseño zoomorfico está pensado para conectar con personas mediante su código de colores.
          </Text>
        </View>
      )}

      {section === 'componentes' && (
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Componentes</Text>
          {[
            'ESP32',
            'Luces LED RGB',
            'Batería desmontable de 9 V',
            'Módulo Step-Up',
            'Estructura: cabeza y cuerpo',
          ].map((item, index) => (
            <View key={item} style={[styles.listRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.listText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {section === 'caracteristicas' && (
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Características</Text>
          {[
            ['Dimensiones', '8cm × 9cm × 31cm'],
            ['Peso', '0.7 kg, (700 g)'],
            ['Batería', '9 V desmontable'],
            ['Carga', 'Cable USB-C'],
          ].map(([label, value], index) => (
            <View key={label} style={[styles.specRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <Text style={[styles.specLabel, { color: colors.mutedForeground }]}>{label}</Text>
              <Text style={[styles.specValue, { color: colors.foreground }]}>{value}</Text>
            </View>
          ))}
        </View>
      )}

      {section === 'cuidados' && (
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cuidados</Text>
          {[
            'Mantener seco',
            'Evitar golpes',
            'No exponer a altas temperaturas',
            'Usar cualquier cargador USB-C',
            'Limpiar con paño suave',
          ].map((item, index) => (
            <View key={item} style={[styles.careRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <Ionicons name="checkmark-circle-outline" size={19} color={colors.primary} />
              <Text style={[styles.listText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={[styles.footerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>ROBOT KAIRI · V1.0.0</Text>
        <View style={[styles.footerLine, { backgroundColor: colors.border }]} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 22 },
  header: { marginTop: 10, marginBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '800', marginBottom: 5 },
  title: { fontSize: 29, fontWeight: '800' },
  logo: { width: 55, height: 55, borderRadius: 14 },
  tabRail: { flexDirection: 'row', flexWrap: 'wrap', padding: 6, borderRadius: 16, borderWidth: 1, columnGap: 5, rowGap: 5, marginBottom: 16 },
  tab: { minHeight: 38, borderRadius: 11, paddingHorizontal: 9, width: '48%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  tabText: { fontSize: 10, fontWeight: '700' },
  featureCard: { borderWidth: 1, borderRadius: 20, padding: 19, minHeight: 238 },
  featureIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  bodyCopy: { fontSize: 14, lineHeight: 22 },
  infoCard: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 17, paddingVertical: 18 },
  listRow: { minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  bullet: { width: 7, height: 7, borderRadius: 4 },
  listText: { fontSize: 13, lineHeight: 19, flex: 1 },
  specRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 10 },
  specLabel: { fontSize: 13 },
  specValue: { fontSize: 13, fontWeight: '700', textAlign: 'right' },
  careRow: { minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10 },
  footer: { marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 11 },
  footerLine: { height: 1, flex: 1 },
  footerText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
});
