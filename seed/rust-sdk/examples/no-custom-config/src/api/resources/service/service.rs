use crate::api::*;
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

    pub async fn get_movie(
        &self,
        movie_id: &TypesMovieId,
        options: Option<RequestOptions>,
    ) -> Result<TypesMovie, ApiError> {
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
        request: &TypesMovie,
        options: Option<RequestOptions>,
    ) -> Result<TypesMovieId, ApiError> {
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
    ) -> Result<TypesMetadata, ApiError> {
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
        request: &TypesBigEntity,
        options: Option<RequestOptions>,
    ) -> Result<TypesResponse, ApiError> {
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
        request: &Option<TypesRefreshTokenRequest>,
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
