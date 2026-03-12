import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, RotateCcw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log('[ErrorBoundary] Caught error:', error.message);
    console.log('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconWrap}>
              <AlertTriangle size={32} color="#FF9500" strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>Oups, une erreur est survenue</Text>
            <Text style={styles.message}>
              {this.props.fallbackMessage ?? "L'application a rencontré un problème inattendu. Veuillez réessayer."}
            </Text>
            <TouchableOpacity style={styles.button} onPress={this.handleReset} activeOpacity={0.8}>
              <RotateCcw size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.buttonText}>Réessayer</Text>
            </TouchableOpacity>
            <Text style={styles.contact}>
              Si le problème persiste, contactez-nous à contact@capasseoupas.app
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#222222',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#717171',
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: '#1A2B49',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  contact: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: '#B0B0B0',
    textAlign: 'center' as const,
    lineHeight: 16,
  },
});
