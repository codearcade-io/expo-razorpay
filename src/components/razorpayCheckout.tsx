import {
  ActivityIndicator,
  Linking,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  RazorpayErrorResponse,
  RazorpayOptions,
  RazorpaySuccessResponse,
} from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RazorpayCheckoutProps {
  options: RazorpayOptions; // The exact options object you listed in your prompt
  onSuccess: (data: RazorpaySuccessResponse) => void;
  onFailure: (error: RazorpayErrorResponse) => void;
  onClose: () => void;
}

const RazorpayCheckout = ({
  options,
  onSuccess,
  onFailure,
  onClose,
}: RazorpayCheckoutProps) => {
  // We inject your specific options into the HTML
  // We remove 'handler' from your options because functions can't be passed to WebView
  // We will re-attach our own handler inside the HTML

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { handler, ...optionsWithoutHandler } = options;
  const optionsString = JSON.stringify(optionsWithoutHandler);

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { display: flex; justify-content: center; align-items: center; background-color: transparent; }
        </style>
      </head>
      <body>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          // 1. Parse the options passed from React Native
          var options = ${optionsString};

          // 2. Attach the Success Handler
          options.handler = function (response){
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_SUCCESS',
              data: response
            }));
          };

          // 3. Attach Modal Dismiss (User closed the popup)
          options.modal = {
            ondismiss: function(){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_CLOSED'
              }));
            }
          };

          var rzp1 = new Razorpay(options);

          // 4. Attach Failure Handler (as per your documentation)
          rzp1.on('payment.failed', function (response){
             window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_FAILED',
                error: response.error
             }));
          });

          // 5. Open Widget
          rzp1.open();
        </script> 
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    const message = JSON.parse(event.nativeEvent.data);

    if (message.type === 'PAYMENT_SUCCESS') {
      onSuccess(message.data);
    } else if (message.type === 'PAYMENT_FAILED') {
      onFailure(message.error);
    } else if (message.type === 'PAYMENT_CLOSED') {
      onClose();
    }
  };

  const handleNavigation = (request: any) => {
    const { url } = request;

    // Handle UPI Deep Linking (GPay, PhonePe, Paytm, etc.)
    // If the URL is not http/https, it's likely a scheme for another app
    if (
      !url.startsWith('http') &&
      !url.startsWith('https') &&
      !url.startsWith('about:blank')
    ) {
      Linking.openURL(url).catch((err) => {
        console.error("Couldn't open UPI app", err);
      });
      return false; // Stop WebView from trying to load it
    }
    return true; // Allow normal loading
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide" // Slide up effect like a native sheet
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView
          style={styles.safeContainer}
          edges={['bottom', 'left', 'right']}
        >
          <WebView
            originWhitelist={[
              '*',
              'http://*',
              'https://*',
              'upi://*',
              'tez://*',
              'phonepe://*',
            ]}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleNavigation}
            javaScriptEnabled={true}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loaderContainer}>
                <ActivityIndicator
                  size="large"
                  color={options.theme?.color || '#3399cc'}
                />
              </View>
            )}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  safeContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1001,
    ...StyleSheet.absoluteFillObject,
  },
});

export { RazorpayCheckout };
