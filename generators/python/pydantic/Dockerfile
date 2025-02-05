FROM python:3.9.14

ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV _TYPER_STANDARD_TRACEBACK=1

RUN pip3 install poetry==1.8.5
RUN poetry config virtualenvs.create false

COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./src/__init__.py ./src/__init__.py
COPY ./src/fern_python/__init__.py ./src/fern_python/__init__.py

RUN poetry install

COPY ./core_utilities/pydantic /assets/core_utilities
COPY ./core_utilities/shared /assets/core_utilities
COPY ./src ./src

RUN poetry install

ENTRYPOINT ["python", "-m", "src.fern_python.generators.pydantic_model.cli"]
