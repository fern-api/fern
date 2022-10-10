FROM python:3.9.14

COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./core_utilities/fastapi /assets/core_utilities
COPY ./src ./src

ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1

RUN pip3 install poetry &&\
  poetry config virtualenvs.create false &&\
  poetry install

ENTRYPOINT ["python", "-m", "src.fern_python.generators.fastapi.cli"]
