use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct NoreqbodyClient {
    pub http_client: HttpClient,
}

impl NoreqbodyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn getwithnorequestbody(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<TypesObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(Method::GET, "no-req-body", None, None, options)
            .await
    }

    pub async fn postwithnorequestbody(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::POST, "no-req-body", None, None, options)
            .await
    }
}
