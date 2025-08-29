import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Globe, Download, Upload, Trash2, ChevronRight } from 'lucide-react-native';
import { useTournamentStore } from '@/stores/tournament-store';

export default function SettingsScreen() {
  const { settings, updateSettings, tournaments } = useTournamentStore();
  
  const handleExportData = () => {
    Alert.alert(
      'Exportar Dados',
      'Esta funcionalidade estará disponível em breve.',
      [{ text: 'OK' }]
    );
  };
  
  const handleImportData = () => {
    Alert.alert(
      'Importar Dados',
      'Esta funcionalidade estará disponível em breve.',
      [{ text: 'OK' }]
    );
  };
  
  const handleClearData = () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja apagar todos os torneios? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar', 
          style: 'destructive',
          onPress: () => {
            // This would need to be implemented in the store
            Alert.alert('Sucesso', 'Dados apagados com sucesso.');
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Moon size={20} color="#64748B" />
              <Text style={styles.settingText}>Tema Escuro</Text>
            </View>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(value) => updateSettings({ theme: value ? 'dark' : 'light' })}
              trackColor={{ false: '#E2E8F0', true: '#1E40AF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Globe size={20} color="#64748B" />
              <Text style={styles.settingText}>Idioma</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {settings.language === 'pt' ? 'Português' : 'English'}
              </Text>
              <ChevronRight size={16} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <Download size={20} color="#64748B" />
              <Text style={styles.settingText}>Exportar Dados</Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleImportData}>
            <View style={styles.settingLeft}>
              <Upload size={20} color="#64748B" />
              <Text style={styles.settingText}>Importar Dados</Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <View style={styles.settingLeft}>
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.settingText, { color: '#EF4444' }]}>Limpar Todos os Dados</Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Torneios Criados</Text>
            <Text style={styles.infoValue}>{tournaments.length}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Versão do App</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#64748B',
    marginRight: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#1E293B',
  },
  infoValue: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
});