use crate::{ClientConfig, ApiError};

pub mod headers;
pub mod inlined_request;
pub mod path_param;
pub mod query_param;
pub mod unknown;
pub struct EnumClient {
    pub config: ClientConfig,
    pub headers: HeadersClient,
    pub inlined_request: InlinedRequestClient,
    pub path_param: PathParamClient,
    pub query_param: QueryParamClient,
}

impl EnumClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            headers: HeadersClient::new(config.clone())?,
            inlined_request: InlinedRequestClient::new(config.clone())?,
            path_param: PathParamClient::new(config.clone())?,
            query_param: QueryParamClient::new(config.clone())?
        })
    }

}

pub use headers::*;
pub use inlined_request::*;
pub use path_param::*;
pub use query_param::*;
pub use unknown::*;
