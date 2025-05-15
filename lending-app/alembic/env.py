from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from app.core.config import settings
from app.models import borrower, loan, payment
from sqlmodel import SQLModel

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Get the original database URL from settings
original_db_url = settings.DATABASE_URL
sync_db_url = original_db_url

# Convert asyncpg DSN to a synchronous one for Alembic
if original_db_url and original_db_url.startswith("postgresql+asyncpg://"):
    sync_db_url = original_db_url.replace("postgresql+asyncpg://", "postgresql://", 1)
elif original_db_url and original_db_url.startswith("sqlite+aiosqlite://"):
    # Example if you were using aiosqlite, convert to standard sqlite for alembic
    sync_db_url = original_db_url.replace("sqlite+aiosqlite://", "sqlite://", 1)

# Set the potentially modified (synchronous) SQLAlchemy URL for Alembic
config.set_main_option("sqlalchemy.url", sync_db_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    # url = config.get_main_option("sqlalchemy.url") # Already set above with sync_db_url
    context.configure(
        url=sync_db_url, # Use the modified sync_db_url
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # engine_from_config will now use the sync_db_url set in config.set_main_option
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        # Ensure the URL used here is the synchronous one explicitly if needed,
        # though engine_from_config should pick it from main_option
        # url=sync_db_url 
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online() 