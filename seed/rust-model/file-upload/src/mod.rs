//! Request and response types for the file-upload
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 11 types for API operations
//! - **Model Types**: 9 types for data representation

pub mod id;
pub mod my_object_with_optional;
pub mod my_alias_object;
pub mod my_collection_alias_object;
pub mod my_object;
pub mod object_type;
pub mod my_inline_type;
pub mod model_type;
pub mod open_enum_type;
pub mod post_request;
pub mod justfile_request;
pub mod justfilewithqueryparams_request;
pub mod justfilewithoptionalqueryparams_request;
pub mod withcontenttype_request;
pub mod withformencoding_request;
pub mod withformencodedcontainers_request;
pub mod optionalargs_request;
pub mod withinlinetype_request;
pub mod withjsonproperty_request;
pub mod withliteralandenumtypes_request;

pub use id::Id;
pub use my_object_with_optional::MyObjectWithOptional;
pub use my_alias_object::MyAliasObject;
pub use my_collection_alias_object::MyCollectionAliasObject;
pub use my_object::MyObject;
pub use object_type::ObjectType;
pub use my_inline_type::MyInlineType;
pub use model_type::ModelType;
pub use open_enum_type::OpenEnumType;
pub use post_request::PostRequest;
pub use justfile_request::JustfileRequest;
pub use justfilewithqueryparams_request::JustfilewithqueryparamsRequest;
pub use justfilewithoptionalqueryparams_request::JustfilewithoptionalqueryparamsRequest;
pub use withcontenttype_request::WithcontenttypeRequest;
pub use withformencoding_request::WithformencodingRequest;
pub use withformencodedcontainers_request::WithformencodedcontainersRequest;
pub use optionalargs_request::OptionalargsRequest;
pub use withinlinetype_request::WithinlinetypeRequest;
pub use withjsonproperty_request::WithjsonpropertyRequest;
pub use withliteralandenumtypes_request::WithliteralandenumtypesRequest;

