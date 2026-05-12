from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017/rookies"
    frontend_origin: str = "http://localhost:3000"
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    seed_key: str = ""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_file_encoding="utf-8",
    )

    @property
    def jwt_secret_value(self) -> str:
        if not self.jwt_secret or self.jwt_secret == "change-me-to-a-random-secret":
            raise RuntimeError(
                "JWT_SECRET must be set to a strong random value. "
                "Generate one with: openssl rand -hex 32"
            )
        return self.jwt_secret


settings = Settings()
