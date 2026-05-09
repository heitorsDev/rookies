from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import connect_db, disconnect_db
from app.features.auth.routes import router as auth_router
from app.features.components.routes import router as components_router
from app.features.component_types.routes import router as component_types_router

from app.features.components.routes import router as components_router
from app.features.inventory.routes import router as inventory_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_db()
    yield
    disconnect_db()


app = FastAPI(
    title="Rookies API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix="/api/v1")
app.include_router(components_router, prefix="/api/v1")
app.include_router(component_types_router, prefix="/api/v1")

app.include_router(components_router, prefix="/api/v1")

app.include_router(inventory_router, prefix="/api/v1")



@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}
