import pytest
from unittest.mock import patch, MagicMock
from typing import Union
from seed.client import AsyncSeedExhaustive, SeedExhaustive


@pytest.mark.parametrize("client", [SeedExhaustive(base_url="foo"), AsyncSeedExhaustive(base_url="foo")])
def test_root_client_lazy_loading(client: Union[SeedExhaustive, AsyncSeedExhaustive]):
    """Test lazy loading for accounting client resources."""
    # Initially all private attributes should be None
    assert client._endpoints is None
    assert client._inlined_requests is None
    assert client._no_auth is None
    assert client._no_req_body is None
    assert client._req_with_headers is None
    
    # Accessing properties should trigger lazy loading
    endpoints = client.endpoints
    assert endpoints is not None
    assert client._endpoints is not None
    inlined_requests = client.inlined_requests
    assert inlined_requests is not None
    assert client._inlined_requests is not None
    no_auth = client.no_auth
    assert no_auth is not None
    assert client._no_auth is not None
    no_req_body = client.no_req_body
    assert no_req_body is not None
    assert client._no_req_body is not None
    req_body = client.req_with_headers
    assert req_body is not None
    assert client._req_with_headers is not None

@pytest.mark.parametrize("client", [SeedExhaustive(base_url="foo"), AsyncSeedExhaustive(base_url="foo")])
def test_nested_client_lazy_loading(client: Union[SeedExhaustive, AsyncSeedExhaustive]):
    """Test lazy loading for nested client resources."""

    # Initially all private attributes should be None
    assert client.endpoints._container is None
    assert client.endpoints._content_type is None
    assert client.endpoints._enum is None
    assert client.endpoints._http_methods is None
    assert client.endpoints._object is None
    assert client.endpoints._params is None
    assert client.endpoints._primitive is None
    assert client.endpoints._put is None
    assert client.endpoints._union is None
    assert client.endpoints._urls is None
    
    # Accessing properties should trigger lazy loading  
    container = client.endpoints.container
    assert container is not None
    assert client.endpoints._container is not None
    content_type = client.endpoints.content_type
    assert content_type is not None
    assert client.endpoints._content_type is not None
    enum = client.endpoints.enum
    assert enum is not None
    assert client.endpoints._enum is not None
    http_methods = client.endpoints.http_methods
    assert http_methods is not None
    assert client.endpoints._http_methods is not None
    object = client.endpoints.object
    assert object is not None
    assert client.endpoints._object is not None
    params = client.endpoints.params
    assert params is not None
    assert client.endpoints._params is not None
    primitive = client.endpoints.primitive
    assert primitive is not None
    assert client.endpoints._primitive is not None
    put = client.endpoints.put
    assert put is not None
    assert client.endpoints._put is not None
    union = client.endpoints.union
    assert union is not None
    assert client.endpoints._union is not None
    urls = client.endpoints.urls
    assert urls is not None
    assert client.endpoints._urls is not None


@patch("seed.endpoints.container.client.ContainerClient")
def test_lazy_loading_imports_correct_module(mock_container_client: MagicMock):
    """Test that lazy loading imports the correct module."""
    client = SeedExhaustive(base_url="foo")
    mock_container_client.return_value = MagicMock()
    
    # Initially the private attribute should be None
    assert client.endpoints._container is None
    
    # Accessing the property should trigger import and instantiation
    container = client.endpoints.container
    
    # Verify that the correct class was imported and instantiated
    mock_container_client.assert_called_once()
    assert container is mock_container_client.return_value

@patch("seed.endpoints.container.client.AsyncContainerClient")
def test_lazy_loading_imports_correct_module_async(mock_container_client: MagicMock):
    """Test that lazy loading imports the correct module."""
    client = AsyncSeedExhaustive(base_url="foo")
    mock_container_client.return_value = MagicMock()
    
    # Initially the private attribute should be None
    assert client.endpoints._container is None
    
    # Accessing the property should trigger import and instantiation
    container = client.endpoints.container
    
    # Verify that the correct class was imported and instantiated
    mock_container_client.assert_called_once()
    assert container is mock_container_client.return_value

@pytest.mark.parametrize("client", [SeedExhaustive(base_url="foo"), AsyncSeedExhaustive(base_url="foo")])
def test_cached_instances(client: Union[SeedExhaustive, AsyncSeedExhaustive]):
    endpoints1 = client.endpoints
    endpoints2 = client.endpoints
    assert endpoints1 is endpoints2

    container1 = client.endpoints.container
    container2 = client.endpoints.container
    assert container1 is container2

@pytest.mark.parametrize("client", [SeedExhaustive(base_url="foo"), AsyncSeedExhaustive(base_url="foo")])
def test_lazy_loading_preserves_client_wrapper(client: Union[SeedExhaustive, AsyncSeedExhaustive]):
    endpoints = client.endpoints

    assert endpoints._client_wrapper is client._client_wrapper
    assert endpoints._raw_client._client_wrapper is client._client_wrapper

    container = client.endpoints.container
    assert container._raw_client._client_wrapper is endpoints._client_wrapper
