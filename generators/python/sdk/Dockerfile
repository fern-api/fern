# Stage 1: Build Node CLI
FROM node:20.18-alpine3.20 AS node

RUN apk --no-cache add git zip
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY ./generators/python-v2/sdk/dist/cli.cjs /dist/cli.cjs

# Stage 2: Base Python image with dependencies
FROM python:3.9.14 AS python-base

# Install node and npm.
ENV NODE_VERSION=18.20.1
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# Install ruff.
RUN pip install ruff
RUN ruff --version

# Set Python environment
ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1
ENV HTTPX_LOG_LEVEL=trace

RUN pip3 install poetry==1.8.5
RUN poetry config virtualenvs.create false

# Copy dependency files first to leverage caching
COPY ./generators/python/pyproject.toml ./pyproject.toml
COPY ./generators/python/poetry.lock ./poetry.lock
COPY ./generators/python/src/__init__.py ./src/__init__.py
COPY ./generators/python/src/fern_python/__init__.py ./src/fern_python/__init__.py

RUN poetry install

# Stage 3: Final image
FROM python-base AS final

# Copy Node CLI from first stage and rename it
COPY --from=node /dist/cli.cjs /bin/python-v2
RUN chmod +x /bin/python-v2

# Copy specific assets and source code
COPY ./generators/python/core_utilities/sdk /assets/core_utilities
COPY ./generators/python/core_utilities/shared /assets/core_utilities
COPY ./generators/python/sdk/features.yml /assets/features.yml
COPY ./generators/python/tests /assets/tests
COPY ./generators/python/src ./src
COPY ./generators/python/src/asIs /bin/asIs

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

RUN npm install -f -g @fern-api/generator-cli    

ENTRYPOINT ["python", "-m", "src.fern_python.generators.sdk.cli"]