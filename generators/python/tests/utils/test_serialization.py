# All with aliases
# Empty object
# Nested object
# List of objects
# Union of objects

from core_utilities.sdk.serialization import convert_and_respect_annotation_metadata
from .test_models.union_params import AnimalParams

def test_convert_and_respect_annotation_metadata() -> None:
    pass

def test_convert_and_respect_annotation_metadata_in_list() -> None:
    pass

def test_convert_and_respect_annotation_metadata_in_nested_object() -> None:
    pass

def test_convert_and_respect_annotation_metadata_in_union() -> None:
    data = {"name": "string", "likes_to_woof": True, "animal": "dog"}
    convert_and_respect_annotation_metadata(
        object_=data,
        annotation=AnimalParams
    )

def test_convert_and_respect_annotation_metadata_with_empty_object() -> None:
    data = {}
    convert_and_respect_annotation_metadata(
        object_=data,
        annotation=AnimalParams
    )