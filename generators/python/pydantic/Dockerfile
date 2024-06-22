FROM python:3.9.14

ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1

COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./core_utilities/pydantic /assets/core_utilities

RUN pip3 install poetry &&\
  poetry config virtualenvs.create false &&\
  poetry install

COPY ./src ./src

RUN poetry install

ENTRYPOINT ["python", "-m", "src.fern_python.generators.pydantic_model.cli"]
