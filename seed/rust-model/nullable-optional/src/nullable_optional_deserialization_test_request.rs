pub use crate::prelude::*;

/// Request body for testing deserialization of null values
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DeserializationTestRequest {
    #[serde(rename = "requiredString")]
    pub required_string: String,
    #[serde(rename = "nullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_string: Option<String>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "optionalNullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_string: Option<Option<String>>,
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