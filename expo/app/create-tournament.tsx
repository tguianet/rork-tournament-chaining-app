import { router } from 'expo-router';
import { ArrowLeft, Trophy } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';

const tournamentSizes = [4, 8, 16, 32, 64] as const;
const tournamentTypes = [
  { value: 'single_elimination', label: 'Eliminação Simples' },
  { value: 'double_elimination', label: 'Eliminação Dupla' }
] as const;

export default function CreateTournamentScreen() {
  const addTournament = useTournamentStore(state => state.addTournament);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'single_elimination' | 'double_elimination'>('single_elimination');
  const [size, setSize] = useState<4 | 8 | 16 | 32 | 64>(8);
  const [rules, setRules] = useState('');
  
  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para o torneio.');
      return;
    }
    
    addTournament({
      name: name.trim(),
      type,
      size,
      rules: rules.trim() || undefined,
      participants: [],
      matches: [],
      status: 'setup'
    });
    
    Alert.alert(
      'Sucesso',
      'Torneio criado com sucesso!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Torneio</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Trophy size={60} color="#1E40AF" />
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Torneio</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Campeonato de Tênis 2024"
              placeholderTextColor="#94A3B8"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Torneio</Text>
            <View style={styles.optionsContainer}>
              {tournamentTypes.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    type === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setType(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    type === option.value && styles.optionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tamanho da Chave</Text>
            <View style={styles.sizeContainer}>
              {tournamentSizes.map((sizeOption) => (
                <TouchableOpacity
                  key={sizeOption}
                  style={[
                    styles.sizeButton,
                    size === sizeOption && styles.sizeButtonActive
                  ]}
                  onPress={() => setSize(sizeOption)}
                >
                  <Text style={[
                    styles.sizeText,
                    size === sizeOption && styles.sizeTextActive
                  ]}>
                    {sizeOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Regras (Opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={rules}
              onChangeText={setRules}
              placeholder="Descreva as regras específicas do torneio..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Criar Torneio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  sizeTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  createButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});