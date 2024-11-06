from decouple import config

class Config:
    REDIS_HOST = config('REDIS_HOST')
    REDIS_PORT = config('REDIS_PORT')
    REDIS_PASSWORD = config('REDIS_PASSWORD')
    SECRET_KEY = config('SECRET_KEY')
