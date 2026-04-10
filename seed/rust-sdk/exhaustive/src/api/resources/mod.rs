//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **EndpointsContainer**
//! - **EndpointsContentType**
//! - **EndpointsEnum**
//! - **EndpointsHttpMethods**
//! - **EndpointsObject**
//! - **EndpointsPagination**
//! - **EndpointsParams**
//! - **EndpointsPrimitive**
//! - **EndpointsPut**
//! - **EndpointsUnion**
//! - **EndpointsUrLs**
//! - **Inlinedrequests**
//! - **Noauth**
//! - **Noreqbody**
//! - **Reqwithheaders**

use crate::{ApiError, ClientConfig};

pub mod endpoints_container;
pub mod endpoints_content_type;
pub mod endpoints_enum;
pub mod endpoints_http_methods;
pub mod endpoints_object;
pub mod endpoints_pagination;
pub mod endpoints_params;
pub mod endpoints_primitive;
pub mod endpoints_put;
pub mod endpoints_union;
pub mod endpoints_ur_ls;
pub mod inlinedrequests;
pub mod noauth;
pub mod noreqbody;
pub mod reqwithheaders;
pub struct ApiClient {
    pub config: ClientConfig,
    pub endpoints_container: EndpointsContainerClient,
    pub endpoints_content_type: EndpointsContentTypeClient,
    pub endpoints_enum: EndpointsEnumClient,
    pub endpoints_http_methods: EndpointsHttpMethodsClient,
    pub endpoints_object: EndpointsObjectClient,
    pub endpoints_pagination: EndpointsPaginationClient,
    pub endpoints_params: EndpointsParamsClient,
    pub endpoints_primitive: EndpointsPrimitiveClient,
    pub endpoints_put: EndpointsPutClient,
    pub endpoints_union: EndpointsUnionClient,
    pub endpoints_ur_ls: EndpointsUrLsClient,
    pub inlinedrequests: InlinedrequestsClient,
    pub noauth: NoauthClient,
    pub noreqbody: NoreqbodyClient,
    pub reqwithheaders: ReqwithheadersClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            endpoints_container: EndpointsContainerClient::new(config.clone())?,
            endpoints_content_type: EndpointsContentTypeClient::new(config.clone())?,
            endpoints_enum: EndpointsEnumClient::new(config.clone())?,
            endpoints_http_methods: EndpointsHttpMethodsClient::new(config.clone())?,
            endpoints_object: EndpointsObjectClient::new(config.clone())?,
            endpoints_pagination: EndpointsPaginationClient::new(config.clone())?,
            endpoints_params: EndpointsParamsClient::new(config.clone())?,
            endpoints_primitive: EndpointsPrimitiveClient::new(config.clone())?,
            endpoints_put: EndpointsPutClient::new(config.clone())?,
            endpoints_union: EndpointsUnionClient::new(config.clone())?,
            endpoints_ur_ls: EndpointsUrLsClient::new(config.clone())?,
            inlinedrequests: InlinedrequestsClient::new(config.clone())?,
            noauth: NoauthClient::new(config.clone())?,
            noreqbody: NoreqbodyClient::new(config.clone())?,
            reqwithheaders: ReqwithheadersClient::new(config.clone())?,
        })
    }
}

pub use endpoints_container::EndpointsContainerClient;
pub use endpoints_content_type::EndpointsContentTypeClient;
pub use endpoints_enum::EndpointsEnumClient;
pub use endpoints_http_methods::EndpointsHttpMethodsClient;
pub use endpoints_object::EndpointsObjectClient;
pub use endpoints_pagination::EndpointsPaginationClient;
pub use endpoints_params::EndpointsParamsClient;
pub use endpoints_primitive::EndpointsPrimitiveClient;
pub use endpoints_put::EndpointsPutClient;
pub use endpoints_union::EndpointsUnionClient;
pub use endpoints_ur_ls::EndpointsUrLsClient;
pub use inlinedrequests::InlinedrequestsClient;
pub use noauth::NoauthClient;
pub use noreqbody::NoreqbodyClient;
pub use reqwithheaders::ReqwithheadersClient;
