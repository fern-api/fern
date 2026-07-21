use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_content_types::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ContentTypesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .service
    ///         .patch(
    ///             &PatchProxyRequest {
    ///                 application: Some("application".to_string()),
    ///                 require_auth: Some(true),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn patch(
        &self,
        request: &PatchProxyRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Update with JSON merge patch - complex types.
    /// This endpoint demonstrates the distinction between:
    /// - optional<T> fields (can be present or absent, but not null)
    /// - optional<nullable<T>> fields (can be present, absent, or null)
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_content_types::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ContentTypesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .service
    ///         .patch_complex(
    ///             &"id".to_string(),
    ///             &PatchComplexRequest {
    ///                 name: Some("name".to_string()),
    ///                 age: Some(1),
    ///                 active: Some(true),
    ///                 metadata: Some(HashMap::from([(
    ///                     "metadata".to_string(),
    ///                     serde_json::json!({"key":"value"}),
    ///                 )])),
    ///                 tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                 email: Some("email".to_string()),
    ///                 nickname: Some("nickname".to_string()),
    ///                 bio: Some("bio".to_string()),
    ///                 profile_image_url: Some("profileImageUrl".to_string()),
    ///                 settings: Some(HashMap::from([(
    ///                     "settings".to_string(),
    ///                     serde_json::json!({"key":"value"}),
    ///                 )])),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn patch_complex(
        &self,
        id: &str,
        request: &PatchComplexRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("complex/{}", id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Named request with mixed optional/nullable fields and merge-patch content type.
    /// This should trigger the NPE issue when optional fields aren't initialized.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_content_types::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ContentTypesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .service
    ///         .named_patch_with_mixed(
    ///             &"id".to_string(),
    ///             &NamedMixedPatchRequest {
    ///                 app_id: Some("appId".to_string()),
    ///                 instructions: Some("instructions".to_string()),
    ///                 active: Some(true),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn named_patch_with_mixed(
        &self,
        id: &str,
        request: &NamedMixedPatchRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("named-mixed/{}", id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
    /// This endpoint should:
    /// 1. Not NPE when fields are not provided (tests initialization)
    /// 2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_content_types::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ContentTypesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .service
    ///         .optional_merge_patch_test(
    ///             &OptionalMergePatchRequest {
    ///                 required_field: "requiredField".to_string(),
    ///                 optional_string: Some("optionalString".to_string()),
    ///                 optional_integer: Some(1),
    ///                 optional_boolean: Some(true),
    ///                 nullable_string: Some("nullableString".to_string()),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn optional_merge_patch_test(
        &self,
        request: &OptionalMergePatchRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "optional-merge-patch-test",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Regular PATCH endpoint without merge-patch semantics
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_content_types::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ContentTypesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .service
    ///         .regular_patch(
    ///             &"id".to_string(),
    ///             &RegularPatchRequest {
    ///                 field1: Some("field1".to_string()),
    ///                 field2: Some(1),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn regular_patch(
        &self,
        id: &str,
        request: &RegularPatchRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("regular/{}", id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
