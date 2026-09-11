use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct KnowledgeClient {
    pub http_client: HttpClient,
}

impl KnowledgeClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeClient::new(config).expect("Failed to build client");
    ///     client.knowledge.create_knowledge(None).await;
    /// }
    /// ```
    pub async fn create_knowledge(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Knowledge, ApiError> {
        self.http_client
            .execute_request(Method::POST, "v1/Knowledge", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeClient::new(config).expect("Failed to build client");
    ///     client.knowledge.list_knowledge_bases(None).await;
    /// }
    /// ```
    pub async fn list_knowledge_bases(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<KnowledgeBase>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "v1/KnowledgeBases", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeClient::new(config).expect("Failed to build client");
    ///     client
    ///         .knowledge
    ///         .fetch_knowledge_base(&"id".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn fetch_knowledge_base(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<KnowledgeBase, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("v1/KnowledgeBases/{}", id),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeClient::new(config).expect("Failed to build client");
    ///     client.knowledge.patch_base(&"id".to_string(), None).await;
    /// }
    /// ```
    pub async fn patch_base(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<KnowledgeBase, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("v1/KnowledgeBases/{}", id),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeClient::new(config).expect("Failed to build client");
    ///     client
    ///         .knowledge
    ///         .fetch_operation(&"id".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn fetch_operation(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Operation, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("v1/Operations/{}", id),
                None,
                None,
                options,
            )
            .await
    }
}
