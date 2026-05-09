from mongoengine import connect, disconnect

from app.config import settings


def connect_db():
    connect(host=settings.mongodb_uri)


def disconnect_db():
    disconnect()
