use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ObjectClient {
    pub http_client: HttpClient,
}

impl ObjectClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_with_optional_field(
    ///             &ObjectWithOptionalField {
    ///                 string: Some("string".to_string()),
    ///                 integer: Some(1),
    ///                 long: Some(1000000),
    ///                 double: Some(1.1),
    ///                 bool: Some(true),
    ///                 datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
    ///                 date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
    ///                 uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///                 base64: Some(
    ///                     base64::engine::general_purpose::STANDARD
    ///                         .decode("SGVsbG8gd29ybGQh")
    ///                         .unwrap(),
    ///                 ),
    ///                 list: Some(vec!["list".to_string(), "list".to_string()]),
    ///                 set: Some(HashSet::from(["set".to_string()])),
    ///                 map: Some(HashMap::from([(1, "map".to_string())])),
    ///                 bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_with_optional_field(
        &self,
        request: &ObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-optional-field",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_with_required_field(
    ///             &ObjectWithRequiredField {
    ///                 string: "string".to_string(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_with_required_field(
        &self,
        request: &ObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-required-field",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_with_map_of_map(
    ///             &ObjectWithMapOfMap {
    ///                 map: HashMap::from([(
    ///                     "map".to_string(),
    ///                     HashMap::from([("map".to_string(), "map".to_string())]),
    ///                 )]),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_with_map_of_map(
        &self,
        request: &ObjectWithMapOfMap,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithMapOfMap, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-map-of-map",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_nested_with_optional_field(
    ///             &NestedObjectWithOptionalField {
    ///                 string: Some("string".to_string()),
    ///                 nested_object: Some(ObjectWithOptionalField {
    ///                     string: Some("string".to_string()),
    ///                     integer: Some(1),
    ///                     long: Some(1000000),
    ///                     double: Some(1.1),
    ///                     bool: Some(true),
    ///                     datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
    ///                     date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
    ///                     uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///                     base64: Some(
    ///                         base64::engine::general_purpose::STANDARD
    ///                             .decode("SGVsbG8gd29ybGQh")
    ///                             .unwrap(),
    ///                     ),
    ///                     list: Some(vec!["list".to_string(), "list".to_string()]),
    ///                     set: Some(HashSet::from(["set".to_string()])),
    ///                     map: Some(HashMap::from([(1, "map".to_string())])),
    ///                     bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
    ///                     ..Default::default()
    ///                 }),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_nested_with_optional_field(
        &self,
        request: &NestedObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<NestedObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-nested-with-optional-field",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_nested_with_required_field(
    ///             &"string".to_string(),
    ///             &NestedObjectWithRequiredField {
    ///                 string: "string".to_string(),
    ///                 nested_object: ObjectWithOptionalField {
    ///                     string: Some("string".to_string()),
    ///                     integer: Some(1),
    ///                     long: Some(1000000),
    ///                     double: Some(1.1),
    ///                     bool: Some(true),
    ///                     datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
    ///                     date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
    ///                     uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///                     base64: Some(
    ///                         base64::engine::general_purpose::STANDARD
    ///                             .decode("SGVsbG8gd29ybGQh")
    ///                             .unwrap(),
    ///                     ),
    ///                     list: Some(vec!["list".to_string(), "list".to_string()]),
    ///                     set: Some(HashSet::from(["set".to_string()])),
    ///                     map: Some(HashMap::from([(1, "map".to_string())])),
    ///                     bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
    ///                     ..Default::default()
    ///                 },
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_nested_with_required_field(
        &self,
        string: &str,
        request: &NestedObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<NestedObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/object/get-and-return-nested-with-required-field/{}",
                    string
                ),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_nested_with_required_field_as_list(
    ///             &vec![
    ///                 NestedObjectWithRequiredField {
    ///                     string: "string".to_string(),
    ///                     nested_object: ObjectWithOptionalField {
    ///                         string: Some("string".to_string()),
    ///                         integer: Some(1),
    ///                         long: Some(1000000),
    ///                         double: Some(1.1),
    ///                         bool: Some(true),
    ///                         datetime: Some(
    ///                             DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         ),
    ///                         date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
    ///                         uuid: Some(
    ///                             Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                         ),
    ///                         base64: Some(
    ///                             base64::engine::general_purpose::STANDARD
    ///                                 .decode("SGVsbG8gd29ybGQh")
    ///                                 .unwrap(),
    ///                         ),
    ///                         list: Some(vec!["list".to_string(), "list".to_string()]),
    ///                         set: Some(HashSet::from(["set".to_string()])),
    ///                         map: Some(HashMap::from([(1, "map".to_string())])),
    ///                         bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
    ///                         ..Default::default()
    ///                     },
    ///                     ..Default::default()
    ///                 },
    ///                 NestedObjectWithRequiredField {
    ///                     string: "string".to_string(),
    ///                     nested_object: ObjectWithOptionalField {
    ///                         string: Some("string".to_string()),
    ///                         integer: Some(1),
    ///                         long: Some(1000000),
    ///                         double: Some(1.1),
    ///                         bool: Some(true),
    ///                         datetime: Some(
    ///                             DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         ),
    ///                         date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
    ///                         uuid: Some(
    ///                             Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                         ),
    ///                         base64: Some(
    ///                             base64::engine::general_purpose::STANDARD
    ///                                 .decode("SGVsbG8gd29ybGQh")
    ///                                 .unwrap(),
    ///                         ),
    ///                         list: Some(vec!["list".to_string(), "list".to_string()]),
    ///                         set: Some(HashSet::from(["set".to_string()])),
    ///                         map: Some(HashMap::from([(1, "map".to_string())])),
    ///                         bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
    ///                         ..Default::default()
    ///                     },
    ///                     ..Default::default()
    ///                 },
    ///             ],
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_nested_with_required_field_as_list(
        &self,
        request: &Vec<NestedObjectWithRequiredField>,
        options: Option<RequestOptions>,
    ) -> Result<NestedObjectWithRequiredField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-nested-with-required-field-list",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_with_unknown_field(
    ///             &ObjectWithUnknownField {
    ///                 unknown: serde_json::json!({"$ref":"https://example.com/schema"}),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_with_unknown_field(
        &self,
        request: &ObjectWithUnknownField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithUnknownField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-unknown-field",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_with_documented_unknown_type(
    ///             &ObjectWithDocumentedUnknownType {
    ///                 documented_unknown_type: DocumentedUnknownType(serde_json::json!({"key":"value"})),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_with_documented_unknown_type(
        &self,
        request: &ObjectWithDocumentedUnknownType,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithDocumentedUnknownType, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-documented-unknown-type",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_map_of_documented_unknown_type(
    ///             &MapOfDocumentedUnknownType(HashMap::from([(
    ///                 "string".to_string(),
    ///                 DocumentedUnknownType(serde_json::json!({"key":"value"})),
    ///             )])),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_map_of_documented_unknown_type(
        &self,
        request: &MapOfDocumentedUnknownType,
        options: Option<RequestOptions>,
    ) -> Result<MapOfDocumentedUnknownType, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-map-of-documented-unknown-type",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Tests that dynamic snippets include all required properties in the
    /// object initializer, even when the example omits some required fields.
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
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_with_mixed_required_and_optional_fields(
    ///             &ObjectWithMixedRequiredAndOptionalFields {
    ///                 required_string: "hello".to_string(),
    ///                 required_integer: 0,
    ///                 optional_string: Some("world".to_string()),
    ///                 required_long: 0,
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_with_mixed_required_and_optional_fields(
        &self,
        request: &ObjectWithMixedRequiredAndOptionalFields,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithMixedRequiredAndOptionalFields, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-mixed-required-and-optional-fields",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Tests that dynamic snippets recursively construct default objects for
    /// required properties whose type is a named object. When the example
    /// omits the nested object, the generator should construct a default
    /// initializer with the nested object's required properties filled in.
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
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_with_required_nested_object(
    ///             &ObjectWithRequiredNestedObject {
    ///                 required_string: "hello".to_string(),
    ///                 required_object: NestedObjectWithRequiredField {
    ///                     string: "nested".to_string(),
    ///                     nested_object: ObjectWithOptionalField {
    ///                         ..Default::default()
    ///                     },
    ///                     ..Default::default()
    ///                 },
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_with_required_nested_object(
        &self,
        request: &ObjectWithRequiredNestedObject,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithRequiredNestedObject, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-required-nested-object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Tests that string fields containing datetime-like values are NOT reformatted.
    /// The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
    /// without being converted to "2023-08-31T14:15:22.000Z".
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
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .object
    ///         .get_and_return_with_datetime_like_string(
    ///             &ObjectWithDatetimeLikeString {
    ///                 datetime_like_string: "2023-08-31T14:15:22Z".to_string(),
    ///                 actual_datetime: DateTime::parse_from_rfc3339("2023-08-31T14:15:22Z").unwrap(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_with_datetime_like_string(
        &self,
        request: &ObjectWithDatetimeLikeString,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithDatetimeLikeString, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/object/get-and-return-with-datetime-like-string",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
