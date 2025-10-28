# Build base image with dependencies
FROM python:3.13.9-slim-bookworm

ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1

RUN pip3 install uv==0.8.23
ENV UV_PROJECT_ENVIRONMENT=/usr/local

# Copy dependency files first to leverage caching
COPY pyproject.toml ./pyproject.toml
COPY uv.lock ./uv.lock
COPY ./src/__init__.py ./src/__init__.py
COPY ./src/fern_python/__init__.py ./src/fern_python/__init__.py

# Build final image
FROM base AS final

# Copy specific assets and source code
COPY ./core_utilities/fastapi /assets/core_utilities
COPY ./core_utilities/shared /assets/core_utilities
COPY ./src ./src

ENTRYPOINT ["uv", "run", "--frozen", "python", "-m", "src.fern_python.generators.fastapi.cli"]
