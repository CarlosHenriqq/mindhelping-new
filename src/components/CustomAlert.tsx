import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Tipos de alerta
type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
}

export function CustomAlert({
  visible,
  type,
  title,
  message,
  onClose,
  confirmText = 'OK',
}: CustomAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle color="#27ae60" size={48} />;
      case 'error':
        return <XCircle color="#e74c3c" size={48} />;
      case 'warning':
        return <AlertCircle color="#f39c12" size={48} />;
      case 'info':
        return <Info color="#3498db" size={48} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#27ae60';
      case 'error':
        return '#e74c3c';
      case 'warning':
        return '#f39c12';
      case 'info':
        return '#3498db';
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>{getIcon()}</View>

          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: getColor() }]}
            onPress={onClose}
          >
            <Text style={styles.confirmBtnText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Hook personalizado para usar o alerta
export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'info' as AlertType,
    title: '',
    message: '',
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  return {
    alertConfig,
    showAlert,
    hideAlert,
    // Atalhos
    showSuccess: (title: string, message: string) =>
      showAlert('success', title, message),
    showError: (title: string, message: string) =>
      showAlert('error', title, message),
    showWarning: (title: string, message: string) =>
      showAlert('warning', title, message),
    showInfo: (title: string, message: string) =>
      showAlert('info', title, message),
  };
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2c3e50',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  confirmBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

// Exemplo de uso
export default function ExampleScreen() {
  const { alertConfig, showSuccess, showError, showWarning, hideAlert } =
    useCustomAlert();

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 15 }}>
      <TouchableOpacity
        style={[styles.confirmBtn, { backgroundColor: '#27ae60' }]}
        onPress={() =>
          showSuccess('Sucesso!', 'Agendamento realizado com sucesso!')
        }
      >
        <Text style={styles.confirmBtnText}>Mostrar Sucesso</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.confirmBtn, { backgroundColor: '#e74c3c' }]}
        onPress={() =>
          showError(
            'Erro',
            'Não é possível agendar uma consulta em horário retroativo.'
          )
        }
      >
        <Text style={styles.confirmBtnText}>Mostrar Erro</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.confirmBtn, { backgroundColor: '#f39c12' }]}
        onPress={() =>
          showWarning('Atenção', 'Verifique os dados antes de continuar.')
        }
      >
        <Text style={styles.confirmBtnText}>Mostrar Aviso</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
      />
    </View>
  );
}