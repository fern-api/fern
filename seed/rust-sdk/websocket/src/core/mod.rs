//! Core client infrastructure

pub mod base64_bytes;
pub mod bigint_string;
pub mod flexible_datetime;
mod http_client;
mod oauth_token_provider;
mod query_parameter_builder;
mod request_options;
mod utils;
#[cfg(feature = "websocket")]
mod websocket;

pub use http_client::{ByteStream, HttpClient, OAuthConfig};
pub use oauth_token_provider::OAuthTokenProvider;
pub use query_parameter_builder::{parse_structured_query, QueryBuilder, QueryBuilderError};
pub use request_options::RequestOptions;
pub use utils::join_url;
#[cfg(feature = "websocket")]
pub use websocket::{
    parse_websocket_message, WebSocketClient, WebSocketMessage, WebSocketOptions, WebSocketState,
};
