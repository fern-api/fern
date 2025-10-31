use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient4 {
    pub http_client: HttpClient,
}

impl ServiceClient4 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_movie(
        &self,
        movie_id: &MovieId,
        options: Option<RequestOptions>,
    ) -> Result<Movie, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/movie/{}", movie_id.0),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn create_movie(
        &self,
        request: &Movie,
        options: Option<RequestOptions>,
    ) -> Result<MovieId, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/movie",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_metadata(
        &self,
        request: &GetMetadataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Metadata2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/metadata",
                None,
                QueryBuilder::new()
                    .bool("shallow", request.shallow.clone())
                    .string("tag", request.tag.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn create_big_entity(
        &self,
        request: &BigEntity,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/big-entity",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn refresh_token(
        &self,
        request: &Option<RefreshTokenRequest>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/refresh-token",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
