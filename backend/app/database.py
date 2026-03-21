import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

# OmniGrievance Database URI
# Using asyncpg driver for asynchronous DB interaction with PostgreSQL + PostGIS
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/omnigrievance"
)

# Initialize the async engine to handle thousands of concurrent spatial connections
engine = create_async_engine(DATABASE_URL, echo=False, pool_size=20, max_overflow=10)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Declarative base for ORM models mapping
Base = declarative_base()

# Dependency to yield DB sessions to FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
