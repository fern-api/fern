# Stage 1: Base Python image with dependencies
FROM python:3.13.9-slim-bookworm

# Install node and npm.
ENV NODE_VERSION=20.19.4
RUN apt update && apt install -y curl git
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version
RUN npm install -g npm@latest

# Install ruff.
RUN pip install ruff
RUN ruff --version

# Set Python environment
ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1
ENV HTTPX_LOG_LEVEL=trace

RUN pip3 install uv==0.8.23
ENV UV_PROJECT_ENVIRONMENT=/usr/local

# Copy dependency files first to leverage caching
COPY ./generators/python/pyproject.toml ./pyproject.toml
COPY ./generators/python/uv.lock ./uv.lock
COPY ./generators/python/src/__init__.py ./src/__init__.py
COPY ./generators/python/src/fern_python/__init__.py ./src/fern_python/__init__.py

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

RUN npm install -f -g @fern-api/generator-cli@0.2.0

ENTRYPOINT ["uv", "run", "--frozen", "python", "-m", "src.fern_python.generators.sdk.cli"]
