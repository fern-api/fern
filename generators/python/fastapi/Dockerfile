FROM python:3.9.14

ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1

RUN apk --no-cache add curl

# Install poetry
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VERSION=1.8.5
RUN curl -sSL https://install.python-poetry.org | python3 -
RUN ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry
# Configure poetry to not create a virtual environment since Docker is already isolated
RUN poetry config virtualenvs.create false

COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./src/__init__.py ./src/__init__.py
COPY ./src/fern_python/__init__.py ./src/fern_python/__init__.py

RUN poetry install

COPY ./core_utilities/fastapi /assets/core_utilities
COPY ./core_utilities/shared /assets/core_utilities
COPY ./src ./src

RUN poetry install

ENTRYPOINT ["python", "-m", "src.fern_python.generators.fastapi.cli"]
