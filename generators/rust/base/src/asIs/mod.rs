//! Core client infrastructure

mod http_client;
mod request_options;
mod query_parameter_builder;
#[cfg(feature = "sse")]
mod sse_stream;
mod utils;

pub use http_client::{ByteStream, HttpClient};
pub use request_options::RequestOptions;
pub use query_parameter_builder::{QueryBuilder, QueryBuilderError, parse_structured_query};
#[cfg(feature = "sse")]
pub use sse_stream::SseStream;
pub use utils::join_url;
