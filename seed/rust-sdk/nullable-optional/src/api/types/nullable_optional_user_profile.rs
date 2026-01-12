pub use crate::prelude::*;

/// Test object with nullable and optional fields
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UserProfile {
    pub id: String,
    pub username: String,
    #[serde(rename = "nullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_string: Option<String>,
    #[serde(rename = "nullableInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_integer: Option<i64>,
    #[serde(rename = "nullableBoolean")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_boolean: Option<bool>,
    #[serde(rename = "nullableDate")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub nullable_date: Option<DateTime<FixedOffset>>,
    #[serde(rename = "nullableObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_object: Option<Address>,
    #[serde(rename = "nullableList")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_list: Option<Vec<String>>,
    #[serde(rename = "nullableMap")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_map: Option<HashMap<String, String>>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "optionalInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_integer: Option<i64>,
    #[serde(rename = "optionalBoolean")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_boolean: Option<bool>,
    #[serde(rename = "optionalDate")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub optional_date: Option<DateTime<FixedOffset>>,
    #[serde(rename = "optionalObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_object: Option<Address>,
    #[serde(rename = "optionalList")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_list: Option<Vec<String>>,
    #[serde(rename = "optionalMap")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_map: Option<HashMap<String, String>>,
    #[serde(rename = "optionalNullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_string: Option<Option<String>>,
    #[serde(rename = "optionalNullableObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_object: Option<Option<Address>>,
}
