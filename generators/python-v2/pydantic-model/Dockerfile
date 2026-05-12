# Bundled npm globals are removed below so npm's JS dependencies cannot be
# flagged or invoked at runtime — this image only runs the bundled CLI via node.
FROM node:24.15-trixie-slim
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn-*
RUN curl -LsSf https://astral.sh/ruff/0.15.7/install.sh | sh
ENV PATH="/root/.local/bin:/root/.cargo/bin:${PATH}"
RUN ruff --version
COPY generators/python-v2/pydantic-model/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
