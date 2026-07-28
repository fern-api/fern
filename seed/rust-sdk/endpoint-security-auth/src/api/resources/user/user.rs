use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_endpoint_security_auth::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    ///     client.user.get_with_bearer(None).await;
    /// }
    /// ```
    pub async fn get_with_bearer(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        let endpoint_auth_headers = self
            .http_client
            .resolve_endpoint_auth_headers(&options, &[&["Bearer"] as &[&str]])
            .await?;
        let options = {
            let mut o = options.unwrap_or_default();
            for (header_key, header_value) in endpoint_auth_headers {
                o.additional_headers.insert(header_key, header_value);
            }
            Some(o)
        };
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_endpoint_security_auth::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    ///     client.user.get_with_bearer(None).await;
    /// }
    /// ```
    pub async fn get_with_api_key(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        let endpoint_auth_headers = self
            .http_client
            .resolve_endpoint_auth_headers(&options, &[&["ApiKey"] as &[&str]])
            .await?;
        let options = {
            let mut o = options.unwrap_or_default();
            for (header_key, header_value) in endpoint_auth_headers {
                o.additional_headers.insert(header_key, header_value);
            }
            Some(o)
        };
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_endpoint_security_auth::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    ///     client.user.get_with_bearer(None).await;
    /// }
    /// ```
    pub async fn get_with_o_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        let endpoint_auth_headers = self
            .http_client
            .resolve_endpoint_auth_headers(&options, &[&["OAuth"] as &[&str]])
            .await?;
        let options = {
            let mut o = options.unwrap_or_default();
            for (header_key, header_value) in endpoint_auth_headers {
                o.additional_headers.insert(header_key, header_value);
            }
            Some(o)
        };
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_endpoint_security_auth::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    ///     client.user.get_with_bearer(None).await;
    /// }
    /// ```
    pub async fn get_with_basic(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        let endpoint_auth_headers = self
            .http_client
            .resolve_endpoint_auth_headers(&options, &[&["Basic"] as &[&str]])
            .await?;
        let options = {
            let mut o = options.unwrap_or_default();
            for (header_key, header_value) in endpoint_auth_headers {
                o.additional_headers.insert(header_key, header_value);
            }
            Some(o)
        };
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_endpoint_security_auth::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    ///     client.user.get_with_bearer(None).await;
    /// }
    /// ```
    pub async fn get_with_inferred_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        let endpoint_auth_headers = self
            .http_client
            .resolve_endpoint_auth_headers(&options, &[&["InferredAuth"] as &[&str]])
            .await?;
        let options = {
            let mut o = options.unwrap_or_default();
            for (header_key, header_value) in endpoint_auth_headers {
                o.additional_headers.insert(header_key, header_value);
            }
            Some(o)
        };
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_endpoint_security_auth::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    ///     client.user.get_with_bearer(None).await;
    /// }
    /// ```
    pub async fn get_with_any_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        let endpoint_auth_headers = self
            .http_client
            .resolve_endpoint_auth_headers(
                &options,
                &[
                    &["Bearer"] as &[&str],
                    &["ApiKey"] as &[&str],
                    &["OAuth"] as &[&str],
                    &["Basic"] as &[&str],
                    &["InferredAuth"] as &[&str],
                ],
            )
            .await?;
        let options = {
            let mut o = options.unwrap_or_default();
            for (header_key, header_value) in endpoint_auth_headers {
                o.additional_headers.insert(header_key, header_value);
            }
            Some(o)
        };
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_endpoint_security_auth::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    ///     client.user.get_with_bearer(None).await;
    /// }
    /// ```
    pub async fn get_with_all_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        let endpoint_auth_headers = self
            .http_client
            .resolve_endpoint_auth_headers(
                &options,
                &[&["Bearer", "ApiKey", "OAuth", "Basic", "InferredAuth"] as &[&str]],
            )
            .await?;
        let options = {
            let mut o = options.unwrap_or_default();
            for (header_key, header_value) in endpoint_auth_headers {
                o.additional_headers.insert(header_key, header_value);
            }
            Some(o)
        };
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }
}
