use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct NullableOptionalClient2 {
    pub http_client: HttpClient,
}

impl NullableOptionalClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Get a user by ID
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .get_user(&"userId".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_user(
        &self,
        user_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<UserResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/users/{}", user_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Create a new user
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .create_user(
    ///             &CreateUserRequest {
    ///                 username: "username".to_string(),
    ///                 email: Some("email".to_string()),
    ///                 phone: Some("phone".to_string()),
    ///                 address: Some(Address {
    ///                     street: "street".to_string(),
    ///                     city: Some("city".to_string()),
    ///                     state: Some("state".to_string()),
    ///                     zip_code: "zipCode".to_string(),
    ///                     country: Some("country".to_string()),
    ///                     building_id: NullableUserId(Some("buildingId".to_string())),
    ///                     tenant_id: OptionalUserId(Some("tenantId".to_string())),
    ///                     ..Default::default()
    ///                 }),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_user(
        &self,
        request: &CreateUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<UserResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Update a user (partial update)
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .update_user(
    ///             &"userId".to_string(),
    ///             &UpdateUserRequest {
    ///                 username: Some("username".to_string()),
    ///                 email: Some("email".to_string()),
    ///                 phone: Some("phone".to_string()),
    ///                 address: Some(Address {
    ///                     street: "street".to_string(),
    ///                     city: Some("city".to_string()),
    ///                     state: Some("state".to_string()),
    ///                     zip_code: "zipCode".to_string(),
    ///                     country: Some("country".to_string()),
    ///                     building_id: NullableUserId(Some("buildingId".to_string())),
    ///                     tenant_id: OptionalUserId(Some("tenantId".to_string())),
    ///                     ..Default::default()
    ///                 }),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_user(
        &self,
        user_id: &str,
        request: &UpdateUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<UserResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("/api/users/{}", user_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// List all users
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .list_users(
    ///             &ListUsersQueryRequest {
    ///                 limit: Some(1),
    ///                 offset: Some(1),
    ///                 include_deleted: Some(true),
    ///                 sort_by: Some("sortBy".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn list_users(
        &self,
        request: &ListUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .int("offset", request.offset.clone())
                    .bool("includeDeleted", request.include_deleted.clone())
                    .serialize("sortBy", request.sort_by.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Search users
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .search_users(
    ///             &SearchUsersQueryRequest {
    ///                 query: "query".to_string(),
    ///                 department: Some("department".to_string()),
    ///                 role: Some("role".to_string()),
    ///                 is_active: Some(true),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn search_users(
        &self,
        request: &SearchUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users/search",
                None,
                QueryBuilder::new()
                    .structured_query("query", request.query.clone())
                    .string("department", request.department.clone())
                    .string("role", request.role.clone())
                    .serialize("isActive", request.is_active.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Create a complex profile to test nullable enums and unions
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .create_complex_profile(
    ///             &ComplexProfile {
    ///                 id: "id".to_string(),
    ///                 nullable_role: Some(UserRole::Admin),
    ///                 optional_role: Some(UserRole::Admin),
    ///                 optional_nullable_role: Some(UserRole::Admin),
    ///                 nullable_status: Some(UserStatus::Active),
    ///                 optional_status: Some(UserStatus::Active),
    ///                 optional_nullable_status: Some(UserStatus::Active),
    ///                 nullable_notification: Some(NotificationMethod::Email {
    ///                     data: EmailNotification {
    ///                         email_address: "emailAddress".to_string(),
    ///                         subject: "subject".to_string(),
    ///                         html_content: Some("htmlContent".to_string()),
    ///                         ..Default::default()
    ///                     },
    ///                 }),
    ///                 optional_notification: Some(NotificationMethod::Email {
    ///                     data: EmailNotification {
    ///                         email_address: "emailAddress".to_string(),
    ///                         subject: "subject".to_string(),
    ///                         html_content: Some("htmlContent".to_string()),
    ///                         ..Default::default()
    ///                     },
    ///                 }),
    ///                 optional_nullable_notification: Some(NotificationMethod::Email {
    ///                     data: EmailNotification {
    ///                         email_address: "emailAddress".to_string(),
    ///                         subject: "subject".to_string(),
    ///                         html_content: Some("htmlContent".to_string()),
    ///                         ..Default::default()
    ///                     },
    ///                 }),
    ///                 nullable_search_result: Some(SearchResult::User {
    ///                     data: UserResponse {
    ///                         id: "id".to_string(),
    ///                         username: "username".to_string(),
    ///                         email: Some("email".to_string()),
    ///                         phone: Some("phone".to_string()),
    ///                         created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         updated_at: Some(
    ///                             DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         ),
    ///                         address: Some(Address {
    ///                             street: "street".to_string(),
    ///                             city: Some("city".to_string()),
    ///                             state: Some("state".to_string()),
    ///                             zip_code: "zipCode".to_string(),
    ///                             country: Some("country".to_string()),
    ///                             building_id: NullableUserId(Some("buildingId".to_string())),
    ///                             tenant_id: OptionalUserId(Some("tenantId".to_string())),
    ///                             ..Default::default()
    ///                         }),
    ///                         ..Default::default()
    ///                     },
    ///                 }),
    ///                 optional_search_result: Some(SearchResult::User {
    ///                     data: UserResponse {
    ///                         id: "id".to_string(),
    ///                         username: "username".to_string(),
    ///                         email: Some("email".to_string()),
    ///                         phone: Some("phone".to_string()),
    ///                         created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         updated_at: Some(
    ///                             DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         ),
    ///                         address: Some(Address {
    ///                             street: "street".to_string(),
    ///                             city: Some("city".to_string()),
    ///                             state: Some("state".to_string()),
    ///                             zip_code: "zipCode".to_string(),
    ///                             country: Some("country".to_string()),
    ///                             building_id: NullableUserId(Some("buildingId".to_string())),
    ///                             tenant_id: OptionalUserId(Some("tenantId".to_string())),
    ///                             ..Default::default()
    ///                         }),
    ///                         ..Default::default()
    ///                     },
    ///                 }),
    ///                 nullable_array: Some(vec![
    ///                     "nullableArray".to_string(),
    ///                     "nullableArray".to_string(),
    ///                 ]),
    ///                 optional_array: Some(vec![
    ///                     "optionalArray".to_string(),
    ///                     "optionalArray".to_string(),
    ///                 ]),
    ///                 optional_nullable_array: Some(vec![
    ///                     "optionalNullableArray".to_string(),
    ///                     "optionalNullableArray".to_string(),
    ///                 ]),
    ///                 nullable_list_of_nullables: Some(vec![
    ///                     Some("nullableListOfNullables".to_string()),
    ///                     Some("nullableListOfNullables".to_string()),
    ///                 ]),
    ///                 nullable_map_of_nullables: Some(HashMap::from([(
    ///                     "nullableMapOfNullables".to_string(),
    ///                     Some(Address {
    ///                         street: "street".to_string(),
    ///                         city: Some("city".to_string()),
    ///                         state: Some("state".to_string()),
    ///                         zip_code: "zipCode".to_string(),
    ///                         country: Some("country".to_string()),
    ///                         building_id: NullableUserId(Some("buildingId".to_string())),
    ///                         tenant_id: OptionalUserId(Some("tenantId".to_string())),
    ///                         ..Default::default()
    ///                     }),
    ///                 )])),
    ///                 nullable_list_of_unions: Some(vec![
    ///                     NotificationMethod::Email {
    ///                         data: EmailNotification {
    ///                             email_address: "emailAddress".to_string(),
    ///                             subject: "subject".to_string(),
    ///                             html_content: Some("htmlContent".to_string()),
    ///                             ..Default::default()
    ///                         },
    ///                     },
    ///                     NotificationMethod::Email {
    ///                         data: EmailNotification {
    ///                             email_address: "emailAddress".to_string(),
    ///                             subject: "subject".to_string(),
    ///                             html_content: Some("htmlContent".to_string()),
    ///                             ..Default::default()
    ///                         },
    ///                     },
    ///                 ]),
    ///                 optional_map_of_enums: Some(HashMap::from([(
    ///                     "optionalMapOfEnums".to_string(),
    ///                     UserRole::Admin,
    ///                 )])),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_complex_profile(
        &self,
        request: &ComplexProfile,
        options: Option<RequestOptions>,
    ) -> Result<ComplexProfile, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/profiles/complex",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Get a complex profile by ID
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .get_complex_profile(&"profileId".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_complex_profile(
        &self,
        profile_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<ComplexProfile, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/profiles/complex/{}", profile_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Update complex profile to test nullable field updates
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .update_complex_profile(
    ///             &"profileId".to_string(),
    ///             &UpdateComplexProfileRequest {
    ///                 nullable_role: Some(UserRole::Admin),
    ///                 nullable_status: Some(UserStatus::Active),
    ///                 nullable_notification: Some(NotificationMethod::Email {
    ///                     data: EmailNotification {
    ///                         email_address: "emailAddress".to_string(),
    ///                         subject: "subject".to_string(),
    ///                         html_content: Some("htmlContent".to_string()),
    ///                         ..Default::default()
    ///                     },
    ///                 }),
    ///                 nullable_search_result: Some(SearchResult::User {
    ///                     data: UserResponse {
    ///                         id: "id".to_string(),
    ///                         username: "username".to_string(),
    ///                         email: Some("email".to_string()),
    ///                         phone: Some("phone".to_string()),
    ///                         created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         updated_at: Some(
    ///                             DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         ),
    ///                         address: Some(Address {
    ///                             street: "street".to_string(),
    ///                             city: Some("city".to_string()),
    ///                             state: Some("state".to_string()),
    ///                             zip_code: "zipCode".to_string(),
    ///                             country: Some("country".to_string()),
    ///                             building_id: NullableUserId(Some("buildingId".to_string())),
    ///                             tenant_id: OptionalUserId(Some("tenantId".to_string())),
    ///                             ..Default::default()
    ///                         }),
    ///                         ..Default::default()
    ///                     },
    ///                 }),
    ///                 nullable_array: Some(vec![
    ///                     "nullableArray".to_string(),
    ///                     "nullableArray".to_string(),
    ///                 ]),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_complex_profile(
        &self,
        profile_id: &str,
        request: &UpdateComplexProfileRequest,
        options: Option<RequestOptions>,
    ) -> Result<ComplexProfile, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("/api/profiles/complex/{}", profile_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Test endpoint for validating null deserialization
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .test_deserialization(
    ///             &DeserializationTestRequest {
    ///                 required_string: "requiredString".to_string(),
    ///                 nullable_string: Some("nullableString".to_string()),
    ///                 optional_string: Some("optionalString".to_string()),
    ///                 optional_nullable_string: Some("optionalNullableString".to_string()),
    ///                 nullable_enum: Some(UserRole::Admin),
    ///                 optional_enum: Some(UserStatus::Active),
    ///                 nullable_union: Some(NotificationMethod::Email {
    ///                     data: EmailNotification {
    ///                         email_address: "emailAddress".to_string(),
    ///                         subject: "subject".to_string(),
    ///                         html_content: Some("htmlContent".to_string()),
    ///                         ..Default::default()
    ///                     },
    ///                 }),
    ///                 optional_union: Some(SearchResult::User {
    ///                     data: UserResponse {
    ///                         id: "id".to_string(),
    ///                         username: "username".to_string(),
    ///                         email: Some("email".to_string()),
    ///                         phone: Some("phone".to_string()),
    ///                         created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         updated_at: Some(
    ///                             DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                         ),
    ///                         address: Some(Address {
    ///                             street: "street".to_string(),
    ///                             city: Some("city".to_string()),
    ///                             state: Some("state".to_string()),
    ///                             zip_code: "zipCode".to_string(),
    ///                             country: Some("country".to_string()),
    ///                             building_id: NullableUserId(Some("buildingId".to_string())),
    ///                             tenant_id: OptionalUserId(Some("tenantId".to_string())),
    ///                             ..Default::default()
    ///                         }),
    ///                         ..Default::default()
    ///                     },
    ///                 }),
    ///                 nullable_list: Some(vec!["nullableList".to_string(), "nullableList".to_string()]),
    ///                 nullable_map: Some(HashMap::from([("nullableMap".to_string(), 1)])),
    ///                 nullable_object: Some(Address {
    ///                     street: "street".to_string(),
    ///                     city: Some("city".to_string()),
    ///                     state: Some("state".to_string()),
    ///                     zip_code: "zipCode".to_string(),
    ///                     country: Some("country".to_string()),
    ///                     building_id: NullableUserId(Some("buildingId".to_string())),
    ///                     tenant_id: OptionalUserId(Some("tenantId".to_string())),
    ///                     ..Default::default()
    ///                 }),
    ///                 optional_object: Some(Organization {
    ///                     id: "id".to_string(),
    ///                     name: "name".to_string(),
    ///                     domain: Some("domain".to_string()),
    ///                     employee_count: Some(1),
    ///                     ..Default::default()
    ///                 }),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn test_deserialization(
        &self,
        request: &DeserializationTestRequest,
        options: Option<RequestOptions>,
    ) -> Result<DeserializationTestResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/test/deserialization",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Filter users by role with nullable enum
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .filter_by_role(
    ///             &FilterByRoleQueryRequest {
    ///                 role: Some(UserRole::Admin),
    ///                 status: Some(UserStatus::Active),
    ///                 secondary_role: Some(UserRole::Admin),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn filter_by_role(
        &self,
        request: &FilterByRoleQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users/filter",
                None,
                QueryBuilder::new()
                    .serialize("role", request.role.clone())
                    .serialize("status", request.status.clone())
                    .serialize("secondaryRole", request.secondary_role.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Get notification settings which may be null
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .get_notification_settings(&"userId".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_notification_settings(
        &self,
        user_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Option<NotificationMethod>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/users/{}/notifications", user_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Update tags to test array handling
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .update_tags(
    ///             &"userId".to_string(),
    ///             &UpdateTagsRequest {
    ///                 tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                 categories: Some(vec!["categories".to_string(), "categories".to_string()]),
    ///                 labels: Some(vec!["labels".to_string(), "labels".to_string()]),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_tags(
        &self,
        user_id: &str,
        request: &UpdateTagsRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<String>, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("/api/users/{}/tags", user_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Get search results with nullable unions
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
    /// use seed_nullable_optional::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableOptionalClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable_optional
    ///         .get_search_results(
    ///             &SearchRequest {
    ///                 query: "query".to_string(),
    ///                 filters: Some(HashMap::from([(
    ///                     "filters".to_string(),
    ///                     Some("filters".to_string()),
    ///                 )])),
    ///                 include_types: Some(vec!["includeTypes".to_string(), "includeTypes".to_string()]),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_search_results(
        &self,
        request: &SearchRequest,
        options: Option<RequestOptions>,
    ) -> Result<Option<Vec<SearchResult>>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/search",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
