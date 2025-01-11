FROM node:lts-slim
RUN apt-get update && apt-get install -y curl
RUN curl -LsSf https://astral.sh/ruff/install.sh | sh
ENV PATH="/root/.cargo/bin:${PATH}"
# RUN ruff --version
COPY generators/python-v2/pydantic-model/dist /dist
ENTRYPOINT ["node", "/dist/cli.cjs"]
