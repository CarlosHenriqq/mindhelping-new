import { Mail, MapPin, Phone } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CardProfissional({ profissional, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(profissional)}>
      <View style={styles.info}>
        <Text style={styles.nome}>{profissional.nome}</Text>
        <Text style={styles.cargo}>{profissional.especialidade}</Text>
        <Text style={styles.texto}><Phone size={16} color={'red'}/>  {profissional.telefone}</Text>
        <Text style={styles.texto}><Mail size={16} color={'black'}/> {profissional.email}</Text>
        <Text style={styles.texto}><MapPin size={16} color={'red'}/> {profissional.endereco}</Text>
      </View>
      <Image
        source={{ uri: profissional.foto }}
        style={styles.imagem}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  nome: {
    fontWeight: "bold",
    fontSize: 16,
  },
  cargo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  texto: {
    fontSize: 13,
    marginBottom: 2,
  },
  imagem: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
