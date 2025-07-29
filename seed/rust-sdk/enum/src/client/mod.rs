pub mod headers;
pub mod inlined_request;
pub mod path_param;
pub mod query_param;

pub struct EnumClient {
    pub headers: HeadersClient,
    pub inlined_request: InlinedRequestClient,
    pub path_param: PathParamClient,
    pub query_param: QueryParamClient,
}

impl EnumClient {
    pub fn new() -> Self {
        Self {
    headers: HeadersClient::new("".to_string()),
    inlined_request: InlinedRequestClient::new("".to_string()),
    path_param: PathParamClient::new("".to_string()),
    query_param: QueryParamClient::new("".to_string())
}
    }

}


pub use headers::HeadersClient;
pub use inlined_request::InlinedRequestClient;
pub use path_param::PathParamClient;
pub use query_param::QueryParamClient;