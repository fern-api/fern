use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UnionClient {
    pub http_client: HttpClient,
}

impl UnionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .get(&MyUnion::String("string".to_string()), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get(
        &self,
        request: &MyUnion,
        options: Option<RequestOptions>,
    ) -> Result<MyUnion, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client.union_.get_metadata(None).await;
    /// }
    /// ```
    pub async fn get_metadata(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Metadata, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/metadata", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .update_metadata(
    ///             &MetadataUnion::OptionalMetadata(OptionalMetadata(Some(HashMap::from([(
    ///                 "string".to_string(),
    ///                 serde_json::json!({"key":"value"}),
    ///             )])))),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_metadata(
        &self,
        request: &MetadataUnion,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                "/metadata",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .call(
    ///             &Request {
    ///                 union: Some(MetadataUnion::OptionalMetadata(OptionalMetadata(Some(
    ///                     HashMap::from([("string".to_string(), serde_json::json!({"key":"value"}))]),
    ///                 )))),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn call(
        &self,
        request: &Request,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/call",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .duplicate_types_union(&UnionWithDuplicateTypes::String("string".to_string()), None)
    ///         .await;
    /// }
    /// ```
    pub async fn duplicate_types_union(
        &self,
        request: &UnionWithDuplicateTypes,
        options: Option<RequestOptions>,
    ) -> Result<UnionWithDuplicateTypes, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/duplicate",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .nested_unions(&NestedUnionRoot::String("string".to_string()), None)
    ///         .await;
    /// }
    /// ```
    pub async fn nested_unions(
        &self,
        request: &NestedUnionRoot,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/nested",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .nested_object_unions(&OuterNestedUnion::String("string".to_string()), None)
    ///         .await;
    /// }
    /// ```
    pub async fn nested_object_unions(
        &self,
        request: &OuterNestedUnion,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/nested-objects",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .aliased_object_union(
    ///             &AliasedObjectUnion::AliasedLeafA(AliasedLeafA(LeafObjectA {
    ///                 only_in_a: "onlyInA".to_string(),
    ///                 shared_number: 1,
    ///                 ..Default::default()
    ///             })),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn aliased_object_union(
        &self,
        request: &AliasedObjectUnion,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/aliased-object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .get_with_base_properties(
    ///             &UnionWithBaseProperties::NamedMetadata(NamedMetadata {
    ///                 name: "name".to_string(),
    ///                 value: HashMap::from([("value".to_string(), serde_json::json!({"key":"value"}))]),
    ///                 ..Default::default()
    ///             }),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_with_base_properties(
        &self,
        request: &UnionWithBaseProperties,
        options: Option<RequestOptions>,
    ) -> Result<UnionWithBaseProperties, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/with-base-properties",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_undiscriminated_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .test_camel_case_properties(
    ///             &PaymentRequest {
    ///                 payment_method: PaymentMethodUnion::TokenizeCard(TokenizeCard {
    ///                     method: "card".to_string(),
    ///                     card_number: "1234567890123456".to_string(),
    ///                     ..Default::default()
    ///                 }),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn test_camel_case_properties(
        &self,
        request: &PaymentRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/camel-case",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
