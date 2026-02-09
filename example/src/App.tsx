import { useRazorpay } from '@codearcade/expo-razorpay';
import { Button, StyleSheet, View } from 'react-native';

export default function App() {
  const { openCheckout, RazorpayUI } = useRazorpay();

  const handlePress = () => {
    openCheckout(
      { key: '', order_id: '', currency: 'INR', name: 'App', amount: 200 },
      {
        onSuccess: () => {},
        onFailure: () => {},
        onClose: () => {},
      }
    );
  };

  return (
    <View style={styles.container}>
      <Button onPress={handlePress} title="Pay" />

      {RazorpayUI}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
