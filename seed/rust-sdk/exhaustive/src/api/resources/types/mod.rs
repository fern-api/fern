use crate::{ApiError, ClientConfig, HttpClient};

pub mod docs;
pub use docs::TypesDocsClient;
pub mod enum_;
pub use enum_::TypesEnumClient;
pub mod object;
pub use object::TypesObjectClient;
pub mod union_;
pub use union_::TypesUnionClient;
pub struct TypesClient {
    pub http_client: HttpClient,
}

impl TypesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }
}
