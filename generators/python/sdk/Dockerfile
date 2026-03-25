# Stage 1: Copy Node.js from official image
FROM node:20.19.4-slim AS node

# Stage 2: Base Python image with dependencies
FROM python:3.13.7-slim AS python-base

# Copy Node.js and npm from the node stage
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git && rm -rf /var/lib/apt/lists/*
RUN node --version
RUN npm --version

# Install ruff.
RUN pip install ruff==0.15.7
RUN ruff --version

# Set Python environment
ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1

# Keep in sync with the poetry-core version in pyproject.toml
RUN pip3 install poetry==1.8.5
RUN poetry config virtualenvs.create false

# Copy dependency files first to leverage caching
COPY ./generators/python/pyproject.toml ./pyproject.toml
COPY ./generators/python/poetry.lock ./poetry.lock
COPY ./generators/python/src/__init__.py ./src/__init__.py
COPY ./generators/python/src/fern_python/__init__.py ./src/fern_python/__init__.py

RUN poetry install

# Copy Node CLI and make it executable
COPY ./generators/python-v2/sdk/dist/cli.cjs /bin/python-v2
RUN chmod +x /bin/python-v2

# Copy specific assets and source code
COPY ./generators/python/core_utilities/sdk /assets/core_utilities
COPY ./generators/python/core_utilities/shared /assets/core_utilities
COPY ./generators/python/sdk/features.yml /assets/features.yml
COPY ./generators/python/tests /assets/tests
COPY ./generators/python/src ./src

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ENTRYPOINT ["python", "-m", "src.fern_python.generators.sdk.cli"]
