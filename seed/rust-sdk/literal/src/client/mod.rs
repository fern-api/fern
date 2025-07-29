pub mod headers;
pub mod inlined;
pub mod path;
pub mod query;
pub mod reference;

pub struct LiteralClient {
    pub headers: HeadersClient,
    pub inlined: InlinedClient,
    pub path: PathClient,
    pub query: QueryClient,
    pub reference: ReferenceClient,
}

impl LiteralClient {
    pub fn new() -> Self {
        Self {
    headers: HeadersClient::new("".to_string()),
    inlined: InlinedClient::new("".to_string()),
    path: PathClient::new("".to_string()),
    query: QueryClient::new("".to_string()),
    reference: ReferenceClient::new("".to_string())
}
    }

}


pub use headers::HeadersClient;
pub use inlined::InlinedClient;
pub use path::PathClient;
pub use query::QueryClient;
pub use reference::ReferenceClient;