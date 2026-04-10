//! Request and response types for the undiscriminated-unions
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 24 types for data representation

pub mod type_with_optional_union;
pub mod my_union;
pub mod nested_union_l_2;
pub mod nested_union_l_1;
pub mod nested_union_root;
pub mod union_with_duplicate_types;
pub mod metadata_union;
pub mod named_metadata;
pub mod optional_metadata;
pub mod metadata;
pub mod key_one;
pub mod key;
pub mod key_type;
pub mod union_with_identical_strings;
pub mod union_with_identical_primitives;
pub mod payment_method_union;
pub mod tokenize_card;
pub mod convert_token;
pub mod union_with_reserved_names_zero;
pub mod union_with_reserved_names_one;
pub mod union_with_reserved_names;
pub mod user_id;
pub mod name;
pub mod union_with_type_aliases;
pub mod request;
pub mod union_test_camel_case_properties_request;

pub use type_with_optional_union::TypeWithOptionalUnion;
pub use my_union::MyUnion;
pub use nested_union_l_2::NestedUnionL2;
pub use nested_union_l_1::NestedUnionL1;
pub use nested_union_root::NestedUnionRoot;
pub use union_with_duplicate_types::UnionWithDuplicateTypes;
pub use metadata_union::MetadataUnion;
pub use named_metadata::NamedMetadata;
pub use optional_metadata::OptionalMetadata;
pub use metadata::Metadata;
pub use key_one::KeyOne;
pub use key::Key;
pub use key_type::KeyType;
pub use union_with_identical_strings::UnionWithIdenticalStrings;
pub use union_with_identical_primitives::UnionWithIdenticalPrimitives;
pub use payment_method_union::PaymentMethodUnion;
pub use tokenize_card::TokenizeCard;
pub use convert_token::ConvertToken;
pub use union_with_reserved_names_zero::UnionWithReservedNamesZero;
pub use union_with_reserved_names_one::UnionWithReservedNamesOne;
pub use union_with_reserved_names::UnionWithReservedNames;
pub use user_id::UserId;
pub use name::Name;
pub use union_with_type_aliases::UnionWithTypeAliases;
pub use request::Request;
pub use union_test_camel_case_properties_request::UnionTestCamelCasePropertiesRequest;

