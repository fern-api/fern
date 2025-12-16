//! Request and response types for the Examples
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 5 types for API operations
//! - **Model Types**: 31 types for data representation

pub mod r#type;
pub mod identifier;
pub mod basic_type;
pub mod complex_type;
pub mod type_with_single_char_property_equal_to_type_starting_letter;
pub mod commons_types_tag;
pub mod commons_types_metadata;
pub mod commons_types_event_info;
pub mod commons_types_data;
pub mod file_service_filename;
pub mod types_movie_id;
pub mod types_movie;
pub mod types_cast_member;
pub mod types_actor;
pub mod types_actress;
pub mod types_stunt_double;
pub mod types_extended_movie;
pub mod types_moment;
pub mod types_file;
pub mod types_directory;
pub mod types_node;
pub mod types_tree;
pub mod types_metadata;
pub mod types_exception;
pub mod types_exception_info;
pub mod types_migration_status;
pub mod types_migration;
pub mod types_request;
pub mod types_response;
pub mod types_response_type;
pub mod types_test;
pub mod types_entity;
pub mod types_big_entity;
pub mod types_cron_job;
pub mod types_refresh_token_request;
pub mod get_metadata_query_request;

pub use r#type::Type;
pub use identifier::Identifier;
pub use basic_type::BasicType;
pub use complex_type::ComplexType;
pub use type_with_single_char_property_equal_to_type_starting_letter::TypeWithSingleCharPropertyEqualToTypeStartingLetter;
pub use commons_types_tag::Tag;
pub use commons_types_metadata::Metadata;
pub use commons_types_event_info::EventInfo;
pub use commons_types_data::Data;
pub use file_service_filename::Filename;
pub use types_movie_id::MovieId;
pub use types_movie::Movie;
pub use types_cast_member::CastMember;
pub use types_actor::Actor;
pub use types_actress::Actress;
pub use types_stunt_double::StuntDouble;
pub use types_extended_movie::ExtendedMovie;
pub use types_moment::Moment;
pub use types_file::File;
pub use types_directory::Directory;
pub use types_node::Node;
pub use types_tree::Tree;
pub use types_metadata::Metadata2;
pub use types_exception::Exception;
pub use types_exception_info::ExceptionInfo;
pub use types_migration_status::MigrationStatus;
pub use types_migration::Migration;
pub use types_request::Request;
pub use types_response::Response;
pub use types_response_type::ResponseType;
pub use types_test::Test;
pub use types_entity::Entity;
pub use types_big_entity::BigEntity;
pub use types_cron_job::CronJob;
pub use types_refresh_token_request::RefreshTokenRequest;
pub use get_metadata_query_request::GetMetadataQueryRequest;

