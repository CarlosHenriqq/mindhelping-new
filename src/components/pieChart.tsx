import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

// Pega a largura da tela para o gráfico ser responsivo
const screenWidth = Dimensions.get("window").width;

const FeelingsPieChart = ({ data  }) => {

  // Verifica se há dados para exibir
  const hasData = data.some(item => item.population > 0);

  if (!hasData) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Nenhum sentimento registrado para exibir no gráfico.</Text>
      </View>
    );
  }

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      <PieChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        center={[10, 0]} // Ajusta a posição central do gráfico
        absolute // Mostra os valores absolutos em vez de porcentagens
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
    paddingHorizontal: 20,
  }
});

export default FeelingsPieChart;
