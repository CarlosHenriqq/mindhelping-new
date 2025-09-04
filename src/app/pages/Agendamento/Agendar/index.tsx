import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function AgendarConsulta() {
  const { id } = useLocalSearchParams(); // 🔹 pega o ID da rota
  const [infoProf, setInfoProf] = useState(null);

  useEffect(() => {
    async function fetchProf() {
      try {
        const { data } = await axios.get(`http://10.11.185.214:3333/professional/${id}`);
        setInfoProf(data);
      } catch (error) {
        console.log("Erro ao buscar profissional:", error);
      }
    }

    if (id) {
      fetchProf();
    }
  }, [id]);

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <Text style={{fontSize:18, fontWeight:"bold"}}>Agendamento de consulta</Text>
      {infoProf ? (
        <Text style={{marginTop:10}}>Profissional: {infoProf.nome}</Text>
      ) : (
        <Text style={{marginTop:10}}>Carregando informações...</Text>
      )}
    </View>
  );
}
