//! Request and response types for the NullableOptional
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 11 types for API operations
//! - **Model Types**: 14 types for data representation

pub mod nullable_optional_nullable_user_id;
pub mod nullable_optional_optional_user_id;
pub mod nullable_optional_user_profile;
pub mod nullable_optional_address;
pub mod nullable_optional_create_user_request;
pub mod nullable_optional_update_user_request;
pub mod nullable_optional_user_role;
pub mod nullable_optional_user_status;
pub mod nullable_optional_notification_method;
pub mod nullable_optional_email_notification;
pub mod nullable_optional_sms_notification;
pub mod nullable_optional_push_notification;
pub mod nullable_optional_search_result;
pub mod nullable_optional_organization;
pub mod nullable_optional_document;
pub mod nullable_optional_complex_profile;
pub mod nullable_optional_deserialization_test_request;
pub mod nullable_optional_deserialization_test_response;
pub mod nullable_optional_user_response;
pub mod update_complex_profile_request;
pub mod update_tags_request;
pub mod search_request;
pub mod list_users_query_request;
pub mod search_users_query_request;
pub mod filter_by_role_query_request;

pub use nullable_optional_nullable_user_id::NullableUserId;
pub use nullable_optional_optional_user_id::OptionalUserId;
pub use nullable_optional_user_profile::UserProfile;
pub use nullable_optional_address::Address;
pub use nullable_optional_create_user_request::CreateUserRequest;
pub use nullable_optional_update_user_request::UpdateUserRequest;
pub use nullable_optional_user_role::UserRole;
pub use nullable_optional_user_status::UserStatus;
pub use nullable_optional_notification_method::NotificationMethod;
pub use nullable_optional_email_notification::EmailNotification;
pub use nullable_optional_sms_notification::SmsNotification;
pub use nullable_optional_push_notification::PushNotification;
pub use nullable_optional_search_result::SearchResult;
pub use nullable_optional_organization::Organization;
pub use nullable_optional_document::Document;
pub use nullable_optional_complex_profile::ComplexProfile;
pub use nullable_optional_deserialization_test_request::DeserializationTestRequest;
pub use nullable_optional_deserialization_test_response::DeserializationTestResponse;
pub use nullable_optional_user_response::UserResponse;
pub use update_complex_profile_request::UpdateComplexProfileRequest;
pub use update_tags_request::UpdateTagsRequest;
pub use search_request::SearchRequest;
pub use list_users_query_request::ListUsersQueryRequest;
pub use search_users_query_request::SearchUsersQueryRequest;
pub use filter_by_role_query_request::FilterByRoleQueryRequest;

