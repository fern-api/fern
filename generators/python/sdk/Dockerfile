FROM node:20.18-alpine3.20 AS node

RUN mkdir -p /nodejs-libs && \
    ldd $(which node) | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp -L '{}' /nodejs-libs/

FROM python:3.9.14-alpine3.16

## Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /nodejs-libs/* /usr/local/lib/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1
ENV HTTPX_LOG_LEVEL=trace

COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./src/__init__.py ./src/__init__.py
COPY ./src/fern_python/__init__.py ./src/fern_python/__init__.py

RUN pip3 install poetry==1.8.5
RUN poetry config virtualenvs.create false
RUN poetry install

COPY ./sdk/features.yml /assets/features.yml
COPY ./core_utilities/sdk /assets/core_utilities
COPY ./core_utilities/shared /assets/core_utilities
COPY ./tests /assets/tests
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
