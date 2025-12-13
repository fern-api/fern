//! Core client infrastructure

mod http_client;
mod query_parameter_builder;
mod request_options;
#[cfg(feature = "sse")]
mod sse_stream;
mod utils;

pub use http_client::{ByteStream, HttpClient};
pub use query_parameter_builder::{parse_structured_query, QueryBuilder, QueryBuilderError};
pub use request_options::RequestOptions;
#[cfg(feature = "sse")]
pub use sse_stream::SseStream;
pub use utils::join_url;
