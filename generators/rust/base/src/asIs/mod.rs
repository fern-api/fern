//! Core client infrastructure

mod http_client;
mod oauth_token_provider;
mod request_options;
mod query_parameter_builder;
#[cfg(feature = "sse")]
mod sse_stream;
#[cfg(feature = "websocket")]
mod websocket;
mod utils;
pub mod flexible_datetime;
pub mod base64_bytes;
pub mod bigint_string;

pub use http_client::{ByteStream, HttpClient, OAuthConfig};
pub use oauth_token_provider::OAuthTokenProvider;
pub use request_options::RequestOptions;
pub use query_parameter_builder::{QueryBuilder, QueryBuilderError, parse_structured_query};
#[cfg(feature = "sse")]
pub use sse_stream::SseStream;
#[cfg(feature = "websocket")]
pub use websocket::{WebSocketClient, WebSocketOptions, WebSocketState, parse_websocket_message};
pub use utils::join_url;
