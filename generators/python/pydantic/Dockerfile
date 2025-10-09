# Build base image with dependencies
FROM python:3.11.13 AS base

ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1

RUN pip3 install poetry==2.2.1
RUN poetry config virtualenvs.create false

# Copy dependency files first to leverage caching
COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./src/__init__.py ./src/__init__.py
COPY ./src/fern_python/__init__.py ./src/fern_python/__init__.py

RUN poetry install

# Build final image
FROM base AS final

# Copy specific assets and source code
COPY ./core_utilities/pydantic /assets/core_utilities
COPY ./core_utilities/shared /assets/core_utilities
COPY ./src ./src

ENTRYPOINT ["python", "-m", "src.fern_python.generators.pydantic_model.cli"]
