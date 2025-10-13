// InputField.tsx
import React from 'react';
import { Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export default function InputField({
  icon,
  type = "text",
  placeholder,
  error,
  style,
  ...props
}) {
  return (
    <View style={{ width: '100%', marginBottom: 10 }}>
      <View style={{ position: 'relative' }}>
        {/* Ícone */}
        <View style={{
          position: 'absolute',
          top: '50%',
          left: 10,
          transform: [{ translateY: -10 }],
          zIndex: 1
        }}>
          {icon}
        </View>

        {type === "dropdown" ? (
          <DropDownPicker
            placeholder={placeholder}
            style={[
              { borderRadius: 20, borderWidth: 1, borderColor: '#DDD', paddingLeft: 40 },
              style
            ]}
            dropDownContainerStyle={{
              borderColor: '#DDD',
              borderBottomEndRadius: 20,
              borderBottomStartRadius: 20
            }}
            {...props}
          />
        ) : (
          <TextInput
            placeholder={placeholder}
            style={[
              { borderRadius: 20, borderWidth: 1, borderColor: '#DDD', paddingLeft: 40, height: 45 },
              style
            ]}
            {...props}
          />
        )}
      </View>

      {/* Mensagem de erro */}
      {error && (
        <Text style={{
          color: '#d64a4aff',
          fontSize: 14,
          marginTop: 5,
          marginLeft: 10
        }}>
          {error}
        </Text>
      )}
    </View>
  );
}
