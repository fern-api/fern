//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Inlinedrequests**
//! - **Noauth**
//! - **Noreqbody**
//! - **Reqwithheaders**
//! - **Endpoints**

use crate::{ApiError, ClientConfig};

pub mod endpoints;
pub mod inlinedrequests;
pub mod noauth;
pub mod noreqbody;
pub mod reqwithheaders;
pub struct ApiClient {
    pub config: ClientConfig,
    pub inlinedrequests: InlinedrequestsClient,
    pub noauth: NoauthClient,
    pub noreqbody: NoreqbodyClient,
    pub reqwithheaders: ReqwithheadersClient,
    pub endpoints: EndpointsClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            inlinedrequests: InlinedrequestsClient::new(config.clone())?,
            noauth: NoauthClient::new(config.clone())?,
            noreqbody: NoreqbodyClient::new(config.clone())?,
            reqwithheaders: ReqwithheadersClient::new(config.clone())?,
            endpoints: EndpointsClient::new(config.clone())?,
        })
    }
}

pub use endpoints::EndpointsClient;
pub use inlinedrequests::InlinedrequestsClient;
pub use noauth::NoauthClient;
pub use noreqbody::NoreqbodyClient;
pub use reqwithheaders::ReqwithheadersClient;
