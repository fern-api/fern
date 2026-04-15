FROM node:22.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*
RUN curl -LsSf https://astral.sh/ruff/0.15.7/install.sh | sh
ENV PATH="/root/.local/bin:/root/.cargo/bin:${PATH}"
ARG GENERATOR_VERSION
ARG GENERATOR_IMAGE
ENV GENERATOR_VERSION=$GENERATOR_VERSION
ENV GENERATOR_IMAGE=$GENERATOR_IMAGE
RUN ruff --version
COPY generators/python-v2/pydantic-model/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
