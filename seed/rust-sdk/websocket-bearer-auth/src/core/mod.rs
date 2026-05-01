//! Core client infrastructure

mod http_client;
mod oauth_token_provider;
pub mod pagination;
mod query_parameter_builder;
mod request_options;
mod utils;
#[cfg(feature = "websocket")]
mod websocket;

pub use http_client::{ByteStream, HttpClient, OAuthConfig, RawResponse};
pub use oauth_token_provider::OAuthTokenProvider;
pub use pagination::{AsyncPaginator, PaginationResult, SyncPaginator};
pub use query_parameter_builder::{parse_structured_query, QueryBuilder, QueryBuilderError};
pub use request_options::RequestOptions;
pub use utils::join_url;
#[cfg(feature = "websocket")]
pub use websocket::{
    DisconnectInfo, WebSocketClient, WebSocketMessage, WebSocketOptions, WebSocketState,
};
