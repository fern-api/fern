"""
Test to demonstrate alias serialization behavior.
This test will print the serialization output to show exactly how aliases behave.
This script should be copied into each generated test directory and run there.
"""

import json
from seed.types.uuid_alias import UuidAlias
from seed.types.serialization_test_object import SerializationTestObject


def test_alias_serialization_demo():
    """Demonstrate how wrapped aliases serialize"""

    # Get the pydantic version to identify which variant we're testing
    import pydantic
    version = getattr(pydantic, 'VERSION', 'unknown')

    print("\n" + "="*80)
    print(f"WRAPPED ALIAS SERIALIZATION DEMONSTRATION - PYDANTIC {version}")
    print("="*80)

    # Test direct alias serialization
    test_uuid = "uuid:550e8400-e29b-41d4-a716-446655440000"
    uuid_alias = UuidAlias.from_str(test_uuid)

    print(f"\n1. DIRECT ALIAS SERIALIZATION:")
    print(f"   Original string: {test_uuid}")
    print(f"   UuidAlias type: {type(uuid_alias)}")

    # Check which field name is used (v1 uses __root__, v2 uses root)
    if hasattr(uuid_alias, '__root__'):
        print(f"   UuidAlias.__root__: {uuid_alias.__root__}")
    if hasattr(uuid_alias, 'root'):
        print(f"   UuidAlias.root: {uuid_alias.root}")

    print(f"   UuidAlias.get_as_str(): {uuid_alias.get_as_str()}")

    # The critical test - how does it serialize?
    uuid_dict = uuid_alias.dict()
    uuid_json = uuid_alias.json()

    print(f"   UuidAlias.dict(): {uuid_dict}")
    print(f"   UuidAlias.json(): {uuid_json}")

    # Test object with alias fields
    print(f"\n2. OBJECT WITH ALIAS FIELDS:")
    test_obj = SerializationTestObject(
        direct_alias=UuidAlias.from_str("uuid:direct-test"),
        alias_in_map={
            UuidAlias.from_str("uuid:map-key1"): "map-value1",
            UuidAlias.from_str("uuid:map-key2"): "map-value2"
        },
        string_to_alias={
            "string-key1": UuidAlias.from_str("uuid:string-value1"),
            "string-key2": UuidAlias.from_str("uuid:string-value2")
        },
        alias_list=[
            UuidAlias.from_str("uuid:list-item1"),
            UuidAlias.from_str("uuid:list-item2")
        ]
    )

    print(f"   SerializationTestObject.dict():")
    obj_dict = test_obj.dict()
    for key, value in obj_dict.items():
        print(f"     {key}: {value}")

    print(f"\n   SerializationTestObject.json():")
    obj_json = test_obj.json()
    print(f"     {obj_json}")

    # Parse and examine JSON structure
    print(f"\n3. PARSED JSON ANALYSIS:")
    parsed = json.loads(obj_json)

    direct_alias = parsed.get('directAlias')
    print(f"   directAlias value: {direct_alias}")
    print(f"   directAlias type: {type(direct_alias)}")

    alias_in_map = parsed.get('aliasInMap', {})
    print(f"   aliasInMap keys: {list(alias_in_map.keys())}")
    print(f"   aliasInMap key types: {[type(k) for k in alias_in_map.keys()]}")
    print(f"   First map key content: {list(alias_in_map.keys())[0] if alias_in_map else 'N/A'}")

    string_to_alias = parsed.get('stringToAlias', {})
    print(f"   stringToAlias values: {list(string_to_alias.values())}")
    print(f"   stringToAlias value types: {[type(v) for v in string_to_alias.values()]}")
    print(f"   First map value content: {list(string_to_alias.values())[0] if string_to_alias else 'N/A'}")

    alias_list = parsed.get('aliasList', [])
    print(f"   aliasList: {alias_list}")
    print(f"   aliasList item types: {[type(item) for item in alias_list]}")
    print(f"   First list item content: {alias_list[0] if alias_list else 'N/A'}")

    print(f"\n4. KEY OBSERVATIONS:")

    # Analyze direct alias behavior
    if isinstance(direct_alias, str):
        print(f"   ✓ Direct alias serializes transparently as string: '{direct_alias}'")
    elif isinstance(direct_alias, dict):
        print(f"   ⚠ Direct alias serializes as wrapper object: {direct_alias}")
    else:
        print(f"   ? Direct alias serializes as: {type(direct_alias)} = {direct_alias}")

    # Analyze map key behavior
    if alias_in_map:
        first_key = list(alias_in_map.keys())[0]
        if isinstance(first_key, str) and first_key.startswith('uuid:'):
            print(f"   ✓ Map keys serialize transparently as strings: '{first_key}'")
        else:
            print(f"   ⚠ Map keys serialize as complex objects: {type(first_key)} = {first_key}")

    # Analyze map value behavior
    if string_to_alias:
        first_value = list(string_to_alias.values())[0]
        if isinstance(first_value, str) and first_value.startswith('uuid:'):
            print(f"   ✓ Map values serialize transparently as strings: '{first_value}'")
        else:
            print(f"   ⚠ Map values serialize as complex objects: {type(first_value)} = {first_value}")

    print("="*80 + "\n")

    # Assert that this test passes so it shows up in the test results
    assert True


if __name__ == "__main__":
    test_alias_serialization_demo()