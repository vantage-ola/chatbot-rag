from swarmauri.vector_stores.concrete.TfidfVectorStore import TfidfVectorStore
from swarmauri.conversations.concrete.MaxSystemContextConversation import MaxSystemContextConversation
from swarmauri.messages.concrete.SystemMessage import SystemMessage
from swarmauri.llms.concrete.GroqModel import GroqModel as LLM
from swarmauri.agents.concrete.RagAgent import RagAgent
from decouple import config

GROQ_API_KEY = config('GROQ_API_KEY')

vector_store = TfidfVectorStore()
rag_system_context = "You are a motorsport racing expert. Answer questions about it precisely and concisely."
rag_conversation = MaxSystemContextConversation(
    system_context=SystemMessage(content=rag_system_context), max_size=4)
rag_agent = RagAgent(
    llm=LLM(api_key=GROQ_API_KEY),
    conversation=rag_conversation,
    system_context=rag_system_context,
    vector_store=vector_store
)

def get_rag_agent_response(query):
    response = rag_agent.exec(query)
    return response