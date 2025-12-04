from .conftest import get_client, verify_request_count


def test_organizations_get_organization() -> None:
    """Test getOrganization endpoint with WireMock"""
    test_id = "organizations.get_organization.0"
    client = get_client(test_id)
    client.organizations.get_organization(tenant_id="tenant_id", organization_id="organization_id")
    verify_request_count(test_id, "GET", "/{tenant_id}/organizations/{organization_id}/", None, 1)


def test_organizations_get_organization_user() -> None:
    """Test getOrganizationUser endpoint with WireMock"""
    test_id = "organizations.get_organization_user.0"
    client = get_client(test_id)
    client.organizations.get_organization_user(organization_id="organization_id", user_id="user_id")
    verify_request_count(test_id, "GET", "/{tenant_id}/organizations/{organization_id}/users/user_id", None, 1)


def test_organizations_search_organizations() -> None:
    """Test searchOrganizations endpoint with WireMock"""
    test_id = "organizations.search_organizations.0"
    client = get_client(test_id)
    client.organizations.search_organizations(organization_id="organization_id", limit=1)
    verify_request_count(test_id, "GET", "/{tenant_id}/organizations/{organization_id}/search", {"limit": "1"}, 1)
