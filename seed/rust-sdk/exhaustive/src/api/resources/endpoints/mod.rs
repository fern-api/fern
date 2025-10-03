use crate::{ApiError, ClientConfig, HttpClient};

pub mod container;
pub use container::EndpointsContainerClient;
pub mod content_type;
pub use content_type::EndpointsContentTypeClient;
pub mod enum_;
pub use enum_::EndpointsEnumClient;
pub mod http_methods;
pub use http_methods::EndpointsHttpMethodsClient;
pub mod object;
pub use object::EndpointsObjectClient;
pub mod params;
pub use params::EndpointsParamsClient;
pub mod primitive;
pub use primitive::EndpointsPrimitiveClient;
pub mod put;
pub use put::EndpointsPutClient;
pub mod union_;
pub use union_::EndpointsUnionClient;
pub mod urls;
pub use urls::EndpointsUrlsClient;
pub struct EndpointsClient {
    pub http_client: HttpClient,
    pub container: EndpointsContainerClient,
    pub content_type: EndpointsContentTypeClient,
    pub enum_: EndpointsEnumClient,
    pub http_methods: EndpointsHttpMethodsClient,
    pub object: EndpointsObjectClient,
    pub params: EndpointsParamsClient,
    pub primitive: EndpointsPrimitiveClient,
    pub put: EndpointsPutClient,
    pub union_: EndpointsUnionClient,
    pub urls: EndpointsUrlsClient,
}
impl EndpointsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            container: EndpointsContainerClient::new(config.clone())?,
            content_type: EndpointsContentTypeClient::new(config.clone())?,
            enum_: EndpointsEnumClient::new(config.clone())?,
            http_methods: EndpointsHttpMethodsClient::new(config.clone())?,
            object: EndpointsObjectClient::new(config.clone())?,
            params: EndpointsParamsClient::new(config.clone())?,
            primitive: EndpointsPrimitiveClient::new(config.clone())?,
            put: EndpointsPutClient::new(config.clone())?,
            union_: EndpointsUnionClient::new(config.clone())?,
            urls: EndpointsUrlsClient::new(config.clone())?,
        })
    }
}
