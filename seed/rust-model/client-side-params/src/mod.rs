//! Request and response types for the client-side-params
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 14 types for API operations
//! - **Model Types**: 5 types for data representation

pub mod resource;
pub mod search_response;
pub mod user;
pub mod identity;
pub mod paginated_user_response;
pub mod connection;
pub mod client_type;
pub mod paginated_client_response;
pub mod service_search_resources_request;
pub mod create_user_request;
pub mod update_user_request;
pub mod listresources_query_request;
pub mod getresource_query_request;
pub mod listusers_query_request;
pub mod getuserbyid_query_request;
pub mod listconnections_query_request;
pub mod getconnection_query_request;
pub mod listclients_query_request;
pub mod getclient_query_request;

pub use resource::Resource;
pub use search_response::SearchResponse;
pub use user::User;
pub use identity::Identity;
pub use paginated_user_response::PaginatedUserResponse;
pub use connection::Connection;
pub use client_type::Client;
pub use paginated_client_response::PaginatedClientResponse;
pub use service_search_resources_request::ServiceSearchResourcesRequest;
pub use create_user_request::CreateUserRequest;
pub use update_user_request::UpdateUserRequest;
pub use listresources_query_request::ListresourcesQueryRequest;
pub use getresource_query_request::GetresourceQueryRequest;
pub use listusers_query_request::ListusersQueryRequest;
pub use getuserbyid_query_request::GetuserbyidQueryRequest;
pub use listconnections_query_request::ListconnectionsQueryRequest;
pub use getconnection_query_request::GetconnectionQueryRequest;
pub use listclients_query_request::ListclientsQueryRequest;
pub use getclient_query_request::GetclientQueryRequest;

