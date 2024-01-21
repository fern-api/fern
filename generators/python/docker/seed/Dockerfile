FROM python:3.10
COPY pyproject.toml ./pyproject.toml
COPY poetry.lock ./poetry.lock
COPY ./src ./src


# Setup pyenv
RUN apt-get install -y git
RUN git clone --depth=1 https://github.com/pyenv/pyenv.git .pyenv
ENV PYENV_ROOT="${HOME}/.pyenv"
ENV PATH="${PYENV_ROOT}/shims:${PYENV_ROOT}/bin:${PATH}"

RUN pyenv install 3.9
RUN pyenv install 3.8

# Setup poetry
RUN pip install poetry  &&\
  poetry config virtualenvs.create false &&\
  poetry install


CMD [ "poetry" ]
