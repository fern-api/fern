use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn patch(
        &self,
        request: &PatchProxyRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn patch_complex(
        &self,
        id: &String,
        request: &PatchComplexRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("complex/{}", id),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn named_patch_with_mixed(
        &self,
        id: &String,
        request: &NamedMixedPatchRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("named-mixed/{}", id),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn optional_merge_patch_test(
        &self,
        request: &OptionalMergePatchRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "optional-merge-patch-test",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn regular_patch(
        &self,
        id: &String,
        request: &RegularPatchRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("regular/{}", id),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
