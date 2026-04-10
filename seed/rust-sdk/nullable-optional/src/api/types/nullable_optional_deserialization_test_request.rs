pub use crate::prelude::*;

/// Request body for testing deserialization of null values
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DeserializationTestRequest {
    #[serde(rename = "requiredString")]
    #[serde(default)]
    pub required_string: String,
    #[serde(rename = "nullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_string: Option<String>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "optionalNullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_string: Option<String>,
    #[serde(rename = "nullableEnum")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_enum: Option<UserRole>,
    #[serde(rename = "optionalEnum")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_enum: Option<UserStatus>,
    #[serde(rename = "nullableUnion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_union: Option<NotificationMethod>,
    #[serde(rename = "optionalUnion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_union: Option<SearchResult>,
    #[serde(rename = "nullableList")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_list: Option<Vec<String>>,
    #[serde(rename = "nullableMap")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_map: Option<HashMap<String, i64>>,
    #[serde(rename = "nullableObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_object: Option<Address>,
    #[serde(rename = "optionalObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_object: Option<Organization>,
}

impl DeserializationTestRequest {
    pub fn builder() -> DeserializationTestRequestBuilder {
        <DeserializationTestRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DeserializationTestRequestBuilder {
    required_string: Option<String>,
    nullable_string: Option<String>,
    optional_string: Option<String>,
    optional_nullable_string: Option<String>,
    nullable_enum: Option<UserRole>,
    optional_enum: Option<UserStatus>,
    nullable_union: Option<NotificationMethod>,
    optional_union: Option<SearchResult>,
    nullable_list: Option<Vec<String>>,
    nullable_map: Option<HashMap<String, i64>>,
    nullable_object: Option<Address>,
    optional_object: Option<Organization>,
}

impl DeserializationTestRequestBuilder {
    pub fn required_string(mut self, value: impl Into<String>) -> Self {
        self.required_string = Some(value.into());
        self
    }

    pub fn nullable_string(mut self, value: impl Into<String>) -> Self {
        self.nullable_string = Some(value.into());
        self
    }

    pub fn optional_string(mut self, value: impl Into<String>) -> Self {
        self.optional_string = Some(value.into());
        self
    }

    pub fn optional_nullable_string(mut self, value: impl Into<String>) -> Self {
        self.optional_nullable_string = Some(value.into());
        self
    }

    pub fn nullable_enum(mut self, value: UserRole) -> Self {
        self.nullable_enum = Some(value);
        self
    }

    pub fn optional_enum(mut self, value: UserStatus) -> Self {
        self.optional_enum = Some(value);
        self
    }

    pub fn nullable_union(mut self, value: NotificationMethod) -> Self {
        self.nullable_union = Some(value);
        self
    }

    pub fn optional_union(mut self, value: SearchResult) -> Self {
        self.optional_union = Some(value);
        self
    }

    pub fn nullable_list(mut self, value: Vec<String>) -> Self {
        self.nullable_list = Some(value);
        self
    }

    pub fn nullable_map(mut self, value: HashMap<String, i64>) -> Self {
        self.nullable_map = Some(value);
        self
    }

    pub fn nullable_object(mut self, value: Address) -> Self {
        self.nullable_object = Some(value);
        self
    }

    pub fn optional_object(mut self, value: Organization) -> Self {
        self.optional_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DeserializationTestRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`required_string`](DeserializationTestRequestBuilder::required_string)
    pub fn build(self) -> Result<DeserializationTestRequest, BuildError> {
        Ok(DeserializationTestRequest {
            required_string: self
                .required_string
                .ok_or_else(|| BuildError::missing_field("required_string"))?,
            nullable_string: self.nullable_string,
            optional_string: self.optional_string,
            optional_nullable_string: self.optional_nullable_string,
            nullable_enum: self.nullable_enum,
            optional_enum: self.optional_enum,
            nullable_union: self.nullable_union,
            optional_union: self.optional_union,
            nullable_list: self.nullable_list,
            nullable_map: self.nullable_map,
            nullable_object: self.nullable_object,
            optional_object: self.optional_object,
        })
    }
}
