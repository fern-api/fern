use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct FolderAServiceClient {
    pub http_client: HttpClient,
}

impl FolderAServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn folder_a_service_get_direct_thread(
        &self,
        request: &FolderAServiceGetDirectThreadQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<FolderAResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "",
                None,
                QueryBuilder::new()
                    .string_array("ids", request.ids.clone())
                    .string_array("tags", request.tags.clone())
                    .build(),
                options,
            )
            .await
    }
}
