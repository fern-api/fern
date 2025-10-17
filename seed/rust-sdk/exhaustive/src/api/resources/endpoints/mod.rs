use crate::{ApiError, ClientConfig, HttpClient};

pub mod container;
pub use container::ContainerClient;
pub mod content_type;
pub use content_type::ContentTypeClient;
pub mod enum_;
pub use enum_::EnumClient;
pub mod http_methods;
pub use http_methods::HttpMethodsClient;
pub mod object;
pub use object::ObjectClient;
pub mod params;
pub use params::ParamsClient;
pub mod primitive;
pub use primitive::PrimitiveClient;
pub mod put;
pub use put::PutClient;
pub mod union_;
pub use union_::UnionClient;
pub mod urls;
pub use urls::UrlsClient;
pub struct EndpointsClient {
    pub http_client: HttpClient,
    pub container: ContainerClient,
    pub content_type: ContentTypeClient,
    pub enum_: EnumClient,
    pub http_methods: HttpMethodsClient,
    pub object: ObjectClient,
    pub params: ParamsClient,
    pub primitive: PrimitiveClient,
    pub put: PutClient,
    pub union_: UnionClient,
    pub urls: UrlsClient,
}
impl EndpointsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            container: ContainerClient::new(config.clone())?,
            content_type: ContentTypeClient::new(config.clone())?,
            enum_: EnumClient::new(config.clone())?,
            http_methods: HttpMethodsClient::new(config.clone())?,
            object: ObjectClient::new(config.clone())?,
            params: ParamsClient::new(config.clone())?,
            primitive: PrimitiveClient::new(config.clone())?,
            put: PutClient::new(config.clone())?,
            union_: UnionClient::new(config.clone())?,
            urls: UrlsClient::new(config.clone())?,
        })
    }
}
