from .conftest import get_client, verify_request_count


def test__search_rule_types() -> None:
    """Test searchRuleTypes endpoint with WireMock"""
    test_id = "search_rule_types.0"
    client = get_client(test_id)
    client.search_rule_types()
    verify_request_count(test_id, "GET", "/rule-types", None, 1)


def test__create_rule() -> None:
    """Test createRule endpoint with WireMock"""
    test_id = "create_rule.0"
    client = get_client(test_id)
    client.create_rule(
        name="name",
        execution_context="prod",
    )
    verify_request_count(test_id, "POST", "/rules", None, 1)


def test__list_users() -> None:
    """Test listUsers endpoint with WireMock"""
    test_id = "list_users.0"
    client = get_client(test_id)
    client.list_users()
    verify_request_count(test_id, "GET", "/users", None, 1)


def test__get_entity() -> None:
    """Test getEntity endpoint with WireMock"""
    test_id = "get_entity.0"
    client = get_client(test_id)
    client.get_entity()
    verify_request_count(test_id, "GET", "/entities", None, 1)


def test__get_organization() -> None:
    """Test getOrganization endpoint with WireMock"""
    test_id = "get_organization.0"
    client = get_client(test_id)
    client.get_organization()
    verify_request_count(test_id, "GET", "/organizations", None, 1)


def test__create_plant() -> None:
    """Test createPlant endpoint with WireMock"""
    test_id = "create_plant.0"
    client = get_client(test_id)
    client.create_plant(
        species="species",
        family="family",
        genus="genus",
        sun_exposure="full",
    )
    verify_request_count(test_id, "POST", "/plants", None, 1)


def test__create_tree() -> None:
    """Test createTree endpoint with WireMock"""
    test_id = "create_tree.0"
    client = get_client(test_id)
    client.create_tree(
        id="id",
    )
    verify_request_count(test_id, "POST", "/trees", None, 1)
