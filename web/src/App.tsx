// src/App.tsx
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Chat from "./components/Chat";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#f5f5f5",
      },
    },
  },
  colors: {
    primary: {
      500: "#E10600", // F1 red
      600: "#B30500",
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Chat />
    </ChakraProvider>
  );
}

export default App;
