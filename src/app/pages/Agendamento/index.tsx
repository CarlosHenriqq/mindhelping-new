import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profissional() {
  const [profissionais, setProfissionais] = useState([]);

  async function getNameProf() {
    try {
      const storedSearch = await AsyncStorage.getItem("searchProf") || "";
      if (storedSearch) {
        console.log("nome buscado:", storedSearch);

        // 🔹 Simulando retorno da API com mocks
        const mockData = [
          {
            id: 1,
            nome: storedSearch,
            email: "teste@" + storedSearch.toLowerCase() + ".com",
            telefone: "(11) 99999-9999",
            endereco: "Rua Exemplo, 123 - SP",
            foto: "https://i.pravatar.cc/150?img=35", // mock de imagem
          },
          {
            id: 2,
            nome: storedSearch + " Silva",
            email: "contato@" + storedSearch.toLowerCase() + ".com",
            telefone: "(21) 98888-8888",
            endereco: "Av. Central, 456 - RJ",
            foto: "https://i.pravatar.cc/150?img=32",
          },
        ];

        setProfissionais(mockData);
      } else {
        setProfissionais([]);
      }
    } catch (error) {
      console.log("Erro ao buscar profissionais:", error);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      getNameProf();
    }, [])
  );

  return (
    <ImageBackground
                source={require('../../../../assets/images/gradiente.png')}
                style={{ flex: 1 }}
                blurRadius={20}
            >
    <View style={{   marginTop:'15%' }}>
      {profissionais.length === 0 ? (
        <View style={styles.empty}>
          <Text>Nenhum profissional encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={profissionais}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card} >
              <Image source={{ uri: item.foto }} style={styles.foto} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.info}>{item.email}</Text>
                <Text style={styles.info}>{item.telefone}</Text>
                <Text style={styles.info}>{item.endereco}</Text>
              </View>
              <TouchableOpacity onPress={() => console.log("clicou", item.nome)}>
              <Text style={{fontFamily:'Nunito', textDecorationLine:'underline', fontWeight:'700'}}>Agendar</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  empty: {
    
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  foto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  nome: {
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    fontSize: 14,
    color: "#666",
  },
});
