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

COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./core_utilities/sdk /assets/core_utilities
COPY ./core_utilities/shared /assets/core_utilities
COPY ./sdk/features.yml /assets/features.yml
COPY ./tests /assets/tests

RUN pip3 install poetry==1.8.5 &&\
  poetry config virtualenvs.create false &&\
  poetry install

COPY ./src ./src

RUN poetry install

ENTRYPOINT ["python", "-m", "src.fern_python.generators.sdk.cli"]

## NOTE: Uncomment the below to generate a flame graph for the python generator.
##       To visualize the flamegraph you can run:
##         - poetry add snakeviz
##         - poetry run snakeviz output.prof
# RUN mkdir -p /fern/output
## For a time-limited run, uncomment the below line and comment the next line.
# ENTRYPOINT ["timeout", "-s", "INT", "5m", "python", "-m", "cProfile", "-o", "/fern/output/output.prof", "/src/fern_python/generators/sdk/cli.py"]
## For a regularly profiled run, uncomment the below line and comment the previous line.
# ENTRYPOINT ["python", "-m", "cProfile", "-o", "/fern/output/output.prof", "/src/fern_python/generators/sdk/cli.py"]
