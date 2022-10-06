FROM python:3.9.14

COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./src ./src

ENV PYTHONPATH=${PYTHONPATH}:${PWD}

RUN pip3 install poetry &&\
  poetry config virtualenvs.create false &&\
  poetry install

ENTRYPOINT ["python", "-m", "src.fern_python.generators.pydantic_model.cli"]
