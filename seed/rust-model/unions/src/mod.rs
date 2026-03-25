//! Request and response types for the Unions
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 24 types for data representation

pub mod bigunion_big_union;
pub mod types_union;
pub mod types_union_with_optional_reference;
pub mod types_union_with_nullable_reference;
pub mod types_union_with_discriminant;
pub mod types_union_with_primitive;
pub mod types_union_with_duplicate_primitive;
pub mod types_union_without_key;
pub mod types_union_with_no_properties;
pub mod types_union_with_multiple_no_properties;
pub mod types_union_with_literal;
pub mod types_union_with_base_properties;
pub mod types_union_with_time;
pub mod types_union_with_optional_time;
pub mod types_union_with_single_element;
pub mod types_union_with_duplicate_types;
pub mod types_union_with_sub_types;
pub mod types_union_with_duplicative_discriminants;
pub mod types_foo;
pub mod types_bar;
pub mod types_union_with_same_string_types;
pub mod types_union_with_same_number_types;
pub mod union_get_shape_request;
pub mod union_with_name;
pub mod union_shape;

pub use bigunion_big_union::BigUnion;
pub use types_union::Union;
pub use types_union_with_optional_reference::UnionWithOptionalReference;
pub use types_union_with_nullable_reference::UnionWithNullableReference;
pub use types_union_with_discriminant::UnionWithDiscriminant;
pub use types_union_with_primitive::UnionWithPrimitive;
pub use types_union_with_duplicate_primitive::UnionWithDuplicatePrimitive;
pub use types_union_without_key::UnionWithoutKey;
pub use types_union_with_no_properties::UnionWithNoProperties;
pub use types_union_with_multiple_no_properties::UnionWithMultipleNoProperties;
pub use types_union_with_literal::UnionWithLiteral;
pub use types_union_with_base_properties::UnionWithBaseProperties;
pub use types_union_with_time::UnionWithTime;
pub use types_union_with_optional_time::UnionWithOptionalTime;
pub use types_union_with_single_element::UnionWithSingleElement;
pub use types_union_with_duplicate_types::UnionWithDuplicateTypes;
pub use types_union_with_sub_types::UnionWithSubTypes;
pub use types_union_with_duplicative_discriminants::UnionWithDuplicativeDiscriminants;
pub use types_foo::Foo;
pub use types_bar::Bar;
pub use types_union_with_same_string_types::UnionWithSameStringTypes;
pub use types_union_with_same_number_types::UnionWithSameNumberTypes;
pub use union_get_shape_request::GetShapeRequest;
pub use union_with_name::WithName;
pub use union_shape::Shape;

