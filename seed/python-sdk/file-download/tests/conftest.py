# This file was auto-generated by Fern from our API Definition.

import os

import pytest
from seed.client import AsyncSeedFileDownload, SeedFileDownload


@pytest.fixture
def client() -> SeedFileDownload:
    return SeedFileDownload(base_url=os.getenv("TESTS_BASE_URL", "base_url"))


@pytest.fixture
def async_client() -> AsyncSeedFileDownload:
    return AsyncSeedFileDownload(base_url=os.getenv("TESTS_BASE_URL", "base_url"))
