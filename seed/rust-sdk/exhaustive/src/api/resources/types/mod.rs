use crate::{ApiError, ClientConfig, HttpClient};

pub mod docs;
pub use docs::DocsClient;
pub mod enum_;
pub use enum_::EnumClient2;
pub mod object;
pub use object::ObjectClient2;
pub mod union_;
pub use union_::UnionClient2;
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
