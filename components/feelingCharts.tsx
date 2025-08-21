import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const FeelingsChart = ({ data, maxValue, layout = 'horizontal' }) => { // O padrão é horizontal
    const isVertical = layout === 'vertical';

    const hasDataToShow = data.some(item => item.value > 0);
    if (!hasDataToShow) {
        return <Text style={styles.chartPlaceholder}>Nenhum dado para exibir.</Text>;
    }

    // O estilo do contêiner principal muda com base no layout
    const containerStyle = isVertical ? styles.chartContainerVertical : styles.chartContainerHorizontal;

    return (
        <View style={containerStyle}>
            {data.map((item, index) => (
                item.value > 0 && (
                    isVertical ? (
                        // Layout da Barra Vertical
                        <View key={index} style={styles.barContainerVertical}>
                            <Text style={styles.barCountVertical}>{item.value}</Text>
                            <View style={styles.barTrackVertical}>
                                <View style={[
                                    styles.barFillVertical,
                                    {
                                        backgroundColor: item.color,
                                        height: `${(item.value / maxValue) * 100}%`
                                    }
                                ]} />
                            </View>
                            <Text style={styles.barLabelVertical}>{item.label}</Text>
                        </View>
                    ) : (
                        // Layout da Barra Horizontal
                        <View key={index} style={styles.barContainerHorizontal}>
                            <Text style={styles.barLabelHorizontal}>{item.label}</Text>
                            <View style={styles.barTrackHorizontal}>
                                <View style={[
                                    styles.barFillHorizontal,
                                    {
                                        backgroundColor: item.color,
                                        width: `${(item.value / maxValue) * 100}%`
                                    }
                                ]} />
                            </View>
                        </View>
                    )
                )
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    chartPlaceholder: {
        flex: 1,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: '#666',
        padding: 20,
    },
    // --- Estilos Horizontais ---
    chartContainerHorizontal: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    barContainerHorizontal: {
        marginBottom: 16,
    },
    barLabelHorizontal: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#333',
    },
    barTrackHorizontal: {
        height: 22,
        backgroundColor: '#f0f0f0',
        borderRadius: 11,
        overflow: 'hidden',
    },
    barFillHorizontal: {
        height: '100%',
        borderRadius: 11,
    },
    // --- Estilos Verticais ---
    chartContainerVertical: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        padding: 20,
    },
     barCountVertical: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4, // Espaço entre o número e a barra
        color: '#333'
    },
    barContainerVertical: {
        alignItems: 'center',
       marginTop:'10%',
       marginBottom:'30%'
    },
    barTrackVertical: {
        height: 180,
        width: 35,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFillVertical: {
        width: '100%',
    },
    barLabelVertical: {
        marginTop: 8,
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default FeelingsChart;
