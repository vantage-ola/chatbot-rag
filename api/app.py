from flask import Flask, request, jsonify
import redis
from config import Config
from agent import get_rag_agent_response

app = Flask(__name__)
app.config.from_object(Config)

# Redis instance
def redis_instance():
    redis_client = redis.Redis(host=app.config['REDIS_HOST'], port=app.config['REDIS_PORT'],
                              password=app.config['REDIS_PASSWORD'], ssl=True)
    return redis_client

@app.route('/chat', methods=['POST'])
def chat():
    # Get the user's query from the request
    query = request.json['query']

    # Get the RAG agent response
    response = get_rag_agent_response(query)

    # Save the query and response to Redis
    redis_client = redis_instance()
    redis_client.rpush('chat_history', f"Query: {query}\nResponse: {response}")

    return jsonify({'response': response})

@app.route('/chat_history', methods=['GET'])
def chat_history():
    # Retrieve all messages from Redis
    redis_client = redis_instance()
    messages = redis_client.lrange('chat_history', 0, -1)
    # Decode messages to strings and format as a JSON response
    formatted_messages = [msg.decode('utf-8') for msg in messages]
    return jsonify({'messages': formatted_messages})


if __name__ == '__main__':
    app.run(debug=True)