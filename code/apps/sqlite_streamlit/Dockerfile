FROM python:3.10-slim

WORKDIR /sqlite_streamlit

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Create directories and files
RUN mkdir data && touch data/default.db && mkdir logs && touch logs/create_table_app.log

# Copy project files
COPY pyproject.toml pyproject.toml
COPY db_util.py db_util.py
COPY app.py app.py
COPY query_app.py query_app.py
COPY create_table_app.py create_table_app.py

# Install dependencies
RUN uv sync --no-dev

# Expose the port where the app will run
EXPOSE 8501

# Run the app
ENTRYPOINT ["uv", "run", "streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
