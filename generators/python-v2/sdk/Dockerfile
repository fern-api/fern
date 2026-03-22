FROM node:22.12-slim
RUN apt-get update && apt-get install -y curl
RUN curl -LsSf https://astral.sh/ruff/0.15.7/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"
RUN ruff --version
COPY generators/python-v2/sdk/dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
