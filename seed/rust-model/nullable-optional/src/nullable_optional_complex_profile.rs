pub use crate::prelude::*;

/// Test object with nullable enums, unions, and arrays
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NullableOptionalComplexProfile {
    pub id: String,
    #[serde(rename = "nullableRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_role: Option<NullableOptionalUserRole>,
    #[serde(rename = "optionalRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_role: Option<NullableOptionalUserRole>,
    #[serde(rename = "optionalNullableRole")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_role: Option<Option<NullableOptionalUserRole>>,
    #[serde(rename = "nullableStatus")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_status: Option<NullableOptionalUserStatus>,
    #[serde(rename = "optionalStatus")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_status: Option<NullableOptionalUserStatus>,
    #[serde(rename = "optionalNullableStatus")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_status: Option<Option<NullableOptionalUserStatus>>,
    #[serde(rename = "nullableNotification")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_notification: Option<NullableOptionalNotificationMethod>,
    #[serde(rename = "optionalNotification")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_notification: Option<NullableOptionalNotificationMethod>,
    #[serde(rename = "optionalNullableNotification")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_notification: Option<Option<NullableOptionalNotificationMethod>>,
    #[serde(rename = "nullableSearchResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_search_result: Option<NullableOptionalSearchResult>,
    #[serde(rename = "optionalSearchResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_search_result: Option<NullableOptionalSearchResult>,
    #[serde(rename = "nullableArray")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_array: Option<Vec<String>>,
    #[serde(rename = "optionalArray")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_array: Option<Vec<String>>,
    #[serde(rename = "optionalNullableArray")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_array: Option<Option<Vec<String>>>,
    #[serde(rename = "nullableListOfNullables")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_list_of_nullables: Option<Vec<Option<String>>>,
    #[serde(rename = "nullableMapOfNullables")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_map_of_nullables: Option<HashMap<String, Option<NullableOptionalAddress>>>,
    #[serde(rename = "nullableListOfUnions")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_list_of_unions: Option<Vec<NullableOptionalNotificationMethod>>,
    #[serde(rename = "optionalMapOfEnums")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_map_of_enums: Option<HashMap<String, NullableOptionalUserRole>>,
}