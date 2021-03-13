import uuid

from sqlalchemy import TypeDecorator, String


class GUID(TypeDecorator):
    impl = String(32)

    def process_bind_param(self, value, dialect):
        if value is not None:
            return "%.32x" % value
        else:
            return None

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            try:
                return uuid.UUID(value)
            except ValueError:
                return value
