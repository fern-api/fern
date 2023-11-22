# Contributing

Thanks for being here! Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you have any feedback on what we could improve, please [open an issue](https://github.com/fern-api/fern-python/issues/new) to discuss it!

## Opening an issue

All contributions start with [an issue](https://github.com/fern-api/fern-python/issues/new). Even if you have a good idea of what the problem is and what the solution looks like, please open an issue. This will give us an opportunity to align on the problem and solution, and to deconflict in the case that somebody else is already working on it.

## How can you help?

Review [our documentation](https://buildwithfern.com/docs?utm_source=github&utm_medium=readme&utm_campaign=fern-python&utm_content=contributing)! We appreciate any help we can get that makes our documentation more digestible.

Talk about Fern in your local meetups! Even our users aren't always aware of some of our features. Learn, then share your knowledge with your own circles.

Write code! We've got lots of open issues - feel free to volunteer for one by commenting on the issue.

## Local development

Our repo is that uses [poetry](https://python-poetry.org/) for environment setup and dependency management.

To get started:

**Step 1: Fork this repo**

Fork by clicking [here](https://github.com/fern-api/fern-python/fork).

**Step 2: Clone your fork**

```
git clone <your fork>
cd fern-python
```

**Step 3: Install Poetry**

See [here](https://python-poetry.org/docs/#installation) for installation instructions.

**Step 4: Install project and open in VSCode**

```
poetry shell
poetry install
code .
```

### Compiling

To compile using `mypy`, run `poetry run mypy`.

### Linting & Formatting

We use [pre-commit](https://pre-commit.com/) to run formatters and linters.
These are run automatically on changed files when you commit.

These are managed by [.pre-commit-config.yaml](.pre-commit-config.yaml). You can run
the steps on all files by running:

```
poetry run pre-commit run --all-files
```

### Tests

To run the [SDK tests](tests/sdk/test_sdk.py):

```
poetry run pytest tests/sdk/test_sdk.py
```

To run the [FastAPI tests](tests/fastapi/test_fastapi.py):

```
poetry run pytest tests/fastapi/test_fastapi.py
```
