use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct OauthClient {
    pub http_client: HttpClient,
}

impl OauthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Authorization-code grant with PKCE. `response_type` is a required literal that is
    /// hardcoded by the generated method; `code_challenge_method` is an optional literal
    /// that must still be sent on the wire when provided.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_oauth_pkce::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = OauthPkceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .oauth
    ///         .authorize(
    ///             &AuthorizeQueryRequest {
    ///                 response_type: "code".to_string(),
    ///                 client_id: "client_abc123".to_string(),
    ///                 redirect_uri: "https://example.com/callback".to_string(),
    ///                 code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM".to_string(),
    ///                 code_challenge_method: Some("S256".to_string()),
    ///                 scope: Some("read write".to_string()),
    ///                 state: Some("xyz".to_string()),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn authorize(
        &self,
        request: &AuthorizeQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AuthorizeResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "oauth/authorize",
                None,
                QueryBuilder::new()
                    .string("response_type", request.response_type.clone())
                    .string("client_id", request.client_id.clone())
                    .string("redirect_uri", request.redirect_uri.clone())
                    .string("code_challenge", request.code_challenge.clone())
                    .string(
                        "code_challenge_method",
                        request.code_challenge_method.clone(),
                    )
                    .string("scope", request.scope.clone())
                    .string("state", request.state.clone())
                    .build(),
                options,
            )
            .await
    }
}
