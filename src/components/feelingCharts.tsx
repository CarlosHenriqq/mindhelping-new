import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const FeelingsChart = ({ data, maxValue, layout = 'horizontal' }) => {
    const isVertical = layout === 'vertical';

    const hasDataToShow = data.some(item => item.value > 0);
    if (!hasDataToShow) {
        return <Text style={styles.chartPlaceholder}>Nenhum dado para exibir.</Text>;
    }

    const containerStyle = isVertical ? styles.chartContainerVertical : styles.chartContainerHorizontal;

    return (
        <View style={containerStyle}>
            {data.map((item, index) => (
                item.value > 0 && (
                    isVertical ? (
                        <View key={index} style={styles.barContainerVertical}>
                            <Text style={[styles.barLabelVertical, { color: '#000000' }]}>{item.label}</Text>
                            <View style={styles.barTrackVertical}>
                                <View style={[styles.barFillVertical, {
                                    backgroundColor: item.color,
                                    height: `${(item.value / maxValue) * 100}%`
                                }]} />
                            </View>
                            <Text style={styles.barValueVertical}>{item.value}</Text>
                        </View>
                    ) : (
                        <View key={index} style={styles.barContainerHorizontal}>
                            <Text style={[styles.barLabelHorizontal, { color: '#000000' }]}>{item.description}</Text>
                            <View style={styles.barTrackHorizontal}>
                                <View style={[styles.barFillHorizontal, {
                                    backgroundColor: item.color,
                                    width: `${(item.value / maxValue) * 100}%`
                                }]} />
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
    // --- Container Horizontal ---
    chartContainerHorizontal: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    barValueVertical: {
  fontSize: 12,
  fontWeight: 'bold',
  textAlign: 'center',
  marginTop: 4,
},

    barContainerHorizontal: {
        marginBottom: 16,
    },
    barLabelHorizontal: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
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
    // --- Container Vertical ---
    chartContainerVertical: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        padding: 20,
    },
    barContainerVertical: {
        alignItems: 'center',
        marginTop: '10%',
        marginBottom: '30%',
    },
    barLabelVertical: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    barTrackVertical: {
        width: 35,
        height: 180,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFillVertical: {
        width: '100%',
        borderRadius: 8,
    },
});

export default FeelingsChart;
