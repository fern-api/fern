FROM python:3.9.14

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

ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1
ENV HTTPX_LOG_LEVEL=trace

RUN pip3 install poetry==1.8.5
RUN poetry config virtualenvs.create false

COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./src/__init__.py ./src/__init__.py
COPY ./src/fern_python/__init__.py ./src/fern_python/__init__.py

RUN poetry install

COPY ./core_utilities/sdk /assets/core_utilities
COPY ./core_utilities/shared /assets/core_utilities
COPY ./sdk/features.yml /assets/features.yml
COPY ./tests /assets/tests
COPY ./src ./src

RUN poetry install
ENTRYPOINT ["python", "-m", "src.fern_python.generators.sdk.cli"]