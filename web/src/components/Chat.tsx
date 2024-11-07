import { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  Icon,
  Heading,
  Avatar,
  InputGroup,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import { FaFlagCheckered, FaArrowRight } from "react-icons/fa";
import { MdSportsMotorsports } from "react-icons/md";
import axios from "axios";

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}
const formatMessageText = (text: string): JSX.Element => {
  // Split query and response if present
  const parts = text.split("\nResponse: ");

  if (parts.length === 2) {
    const [query, response] = parts;
    return (
      <>
        <Text as="span" fontWeight="semibold" color="gray.600">
          {query.replace("Query: ", "")}
        </Text>
        <Box mt={2}>
          {response.split(/\*\*\*|\*\*/).map((part: string, index: number) => {
            if (index % 2 === 1) {
              return (
                <Text as="span" key={index} fontWeight="bold">
                  {part}
                </Text>
              );
            } else if (index % 3 === 2) {
              return (
                <Text
                  as="span"
                  key={index}
                  fontWeight="extrabold"
                  bg="yellow.100"
                  px={1}
                  rounded="sm"
                >
                  {part}
                </Text>
              );
            } else {
              return part.split("\n").map((line: string, lineIndex: number) => {
                if (line.trim().startsWith("*")) {
                  return (
                    <Flex key={`${index}-${lineIndex}`} ml={4} mt={1}>
                      <Text as="span" mr={2}>
                        •
                      </Text>
                      <Text as="span">{line.trim().substring(1).trim()}</Text>
                    </Flex>
                  );
                }
                return (
                  <Text as="span" key={`${index}-${lineIndex}`}>
                    {line}
                    {lineIndex < part.split("\n").length - 1 && <br />}
                  </Text>
                );
              });
            }
          })}
        </Box>
      </>
    );
  }

  return <Text>{text}</Text>;
};

const LoadingMessage = () => (
  <Flex align="flex-end" gap={2}>
    <Avatar
      icon={<MdSportsMotorsports fontSize="1.2rem" />}
      bg="gray.100"
      color="gray.600"
      size="sm"
    />
    <Box
      bg="#f0f0f0"
      px={4}
      py={3}
      borderRadius="2xl"
      borderTopLeftRadius="4px"
      minW="100px"
    >
      <Flex align="center" gap={2}>
        <Spinner size="sm" color="gray.400" />
        <Text fontSize="sm" color="gray.500">
          Loading...
        </Text>
      </Flex>
    </Box>
  </Flex>
);

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat history from the server when the component mounts
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/chat_history")
      .then((response) => {
        const previousMessages = response.data.messages.map((msg: string) => {
          const [query, response] = msg.split("\nResponse: ");
          return {
            text: `Query: ${query}\nResponse: ${response}`,
            isUser: false,
            timestamp: new Date(),
          };
        });
        setMessages(previousMessages);
      })
      .catch((error) => console.error("Error fetching chat history:", error));
  }, []);

  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      text: `Query: ${inputMessage}`,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Send message to the server and get the response
    axios
      .post("http://127.0.0.1:5000/chat", { query: inputMessage })
      .then((response) => {
        const botMessage: ChatMessage = {
          text: `Query: ${inputMessage}\nResponse: ${response.data.response}`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Send message on pressing Enter
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Flex
      w="100vw"
      h="100vh"
      bg="#f0f0f0"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        w="90%"
        maxW="900px"
        h="90vh"
        bg="white"
        borderRadius="2xl"
        boxShadow="lg"
        overflow="hidden"
        mx="auto"
        display="flex"
        flexDirection="column"
        border="1px solid"
        borderColor="gray.200"
        position="relative"
      >
        {/* Header */}
        <Box bg="white" p={4} borderBottom="1px solid" borderColor="gray.200">
          <Flex align="center" justify="center" gap={3}>
            <Icon
              as={FaFlagCheckered}
              w={8}
              h={8}
              color="gray.600"
              transform="rotate(-12deg)"
            />
            <Heading
              size="lg"
              color="gray.800"
              fontWeight="bold"
              letterSpacing="wider"
            >
              Ask Motorsport Questions?
            </Heading>
          </Flex>
          <Text
            color="gray.500"
            textAlign="center"
            mt={1}
            fontSize="sm"
            fontWeight="light"
            letterSpacing="wide"
          >
            Powered by Swarmauri
          </Text>
        </Box>

        {/* Chat Messages Area */}
        <Box
          flex="1"
          overflowY="auto"
          px={6}
          py={4}
          bg="white"
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "#f0f0f0" },
            "&::-webkit-scrollbar-thumb": {
              background: "#999",
              borderRadius: "2px",
            },
          }}
        >
          <VStack spacing={4} align="stretch">
            {/* Welcome Message */}
            {messages.length === 0 && !isLoading && (
              <Flex
                justify="center"
                align="center"
                h="100%"
                direction="column"
                gap={4}
              >
                <Icon
                  as={MdSportsMotorsports}
                  w={16}
                  h={16}
                  color="gray.400"
                  opacity={0.3}
                />
                <Text
                  color="gray.500"
                  textAlign="center"
                  fontSize="md"
                  maxW="md"
                  letterSpacing="wide"
                >
                  Ask me anything about Formula 1, motorsports history, or
                  racing technology!
                </Text>
              </Flex>
            )}

            {messages.map((message, index) => (
              <Flex
                key={index}
                justify={message.isUser ? "flex-end" : "flex-start"}
                align="flex-start"
                gap={2}
              >
                {!message.isUser && (
                  <Avatar
                    icon={<MdSportsMotorsports fontSize="1.2rem" />}
                    bg="gray.100"
                    color="gray.600"
                    size="sm"
                  />
                )}
                <Box
                  maxW="70%"
                  bg={message.isUser ? "gray.800" : "#f0f0f0"}
                  color={message.isUser ? "white" : "gray.800"}
                  px={4}
                  py={3}
                  borderRadius="2xl"
                  borderTopRightRadius={message.isUser ? "4px" : "2xl"}
                  borderTopLeftRadius={!message.isUser ? "4px" : "2xl"}
                  boxShadow="sm"
                >
                  {formatMessageText(message.text)}
                  <Text
                    fontSize="xs"
                    color={message.isUser ? "gray.300" : "gray.500"}
                    textAlign="right"
                    mt={2}
                    opacity={0.8}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Box>
                {message.isUser && (
                  <Avatar
                    bg="gray.100"
                    border="2px solid"
                    borderColor="gray.200"
                    size="sm"
                  />
                )}
              </Flex>
            ))}

            {isLoading && <LoadingMessage />}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        {/* Input Area */}
        <Box p={4} bg="white" borderTop="1px solid" borderColor="gray.200">
          <InputGroup size="lg">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about motorsports..."
              bg="#f0f0f0"
              border="1px solid"
              borderColor="gray.300"
              color="gray.800"
              _placeholder={{ color: "gray.500" }}
              _hover={{ borderColor: "gray.400" }}
              _focus={{
                borderColor: "gray.500",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
              }}
              pr="4.5rem"
              fontSize="sm"
              letterSpacing="wide"
              disabled={isLoading}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                bg={inputMessage.trim() && !isLoading ? "gray.800" : "gray.400"}
                _hover={{
                  bg:
                    inputMessage.trim() && !isLoading ? "gray.700" : "gray.500",
                }}
                onClick={handleSendMessage}
                isDisabled={!inputMessage.trim() || isLoading}
                color="white"
                transition="all 0.2s"
              >
                <FaArrowRight />
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
      </Box>
    </Flex>
  );
};

export default Chat;
