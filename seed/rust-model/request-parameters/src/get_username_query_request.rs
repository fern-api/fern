pub use crate::prelude::*;

/// Query parameters for getUsername
///
/// Request type for the GetUsernameQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetUsernameQueryRequest {
    #[serde(default)]
    pub limit: i64,
    #[serde(default)]
    pub id: Uuid,
    #[serde(default)]
    pub date: NaiveDate,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub deadline: DateTime<FixedOffset>,
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub bytes: Vec<u8>,
    #[serde(default)]
    pub user: User,
    #[serde(rename = "userList")]
    #[serde(default)]
    pub user_list: Vec<User>,
    #[serde(rename = "optionalDeadline")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub optional_deadline: Option<DateTime<FixedOffset>>,
    #[serde(rename = "keyValue")]
    #[serde(default)]
    pub key_value: HashMap<String, String>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "nestedUser")]
    #[serde(default)]
    pub nested_user: NestedUser,
    #[serde(rename = "optionalUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_user: Option<User>,
    #[serde(rename = "excludeUser")]
    #[serde(default)]
    pub exclude_user: Vec<User>,
    #[serde(default)]
    pub filter: Vec<String>,
    #[serde(rename = "longParam")]
    #[serde(default)]
    pub long_param: i64,
    #[serde(rename = "bigIntParam")]
    #[serde(default)]
    #[serde(with = "crate::core::bigint_string")]
    pub big_int_param: num_bigint::BigInt,
}
