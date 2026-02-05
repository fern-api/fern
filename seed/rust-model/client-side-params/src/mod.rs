//! Request and response types for the ClientSideParams
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 14 types for API operations
//! - **Model Types**: 5 types for data representation

pub mod types_resource;
pub mod types_search_response;
pub mod types_user;
pub mod types_identity;
pub mod types_paginated_user_response;
pub mod types_create_user_request;
pub mod types_update_user_request;
pub mod types_connection;
pub mod types_client;
pub mod types_paginated_client_response;
pub mod search_resources_request;
pub mod list_resources_query_request;
pub mod get_resource_query_request;
pub mod list_users_query_request;
pub mod get_user_by_id_query_request;
pub mod list_connections_query_request;
pub mod get_connection_query_request;
pub mod list_clients_query_request;
pub mod get_client_query_request;

pub use types_resource::Resource;
pub use types_search_response::SearchResponse;
pub use types_user::User;
pub use types_identity::Identity;
pub use types_paginated_user_response::PaginatedUserResponse;
pub use types_create_user_request::CreateUserRequest;
pub use types_update_user_request::UpdateUserRequest;
pub use types_connection::Connection;
pub use types_client::Client;
pub use types_paginated_client_response::PaginatedClientResponse;
pub use search_resources_request::SearchResourcesRequest;
pub use list_resources_query_request::ListResourcesQueryRequest;
pub use get_resource_query_request::GetResourceQueryRequest;
pub use list_users_query_request::ListUsersQueryRequest;
pub use get_user_by_id_query_request::GetUserByIdQueryRequest;
pub use list_connections_query_request::ListConnectionsQueryRequest;
pub use get_connection_query_request::GetConnectionQueryRequest;
pub use list_clients_query_request::ListClientsQueryRequest;
pub use get_client_query_request::GetClientQueryRequest;

