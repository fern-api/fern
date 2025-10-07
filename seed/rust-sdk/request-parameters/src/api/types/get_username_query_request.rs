pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetUsernameQueryRequest {
    pub limit: i64,
    pub id: Uuid,
    pub date: NaiveDate,
    pub deadline: DateTime<Utc>,
    pub bytes: String,
    pub user: UserUser,
    #[serde(rename = "userList")]
    pub user_list: Vec<UserUser>,
    #[serde(rename = "optionalDeadline")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_deadline: Option<DateTime<Utc>>,
    #[serde(rename = "keyValue")]
    pub key_value: HashMap<String, String>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "nestedUser")]
    pub nested_user: UserNestedUser,
    #[serde(rename = "optionalUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_user: Option<UserUser>,
    #[serde(rename = "excludeUser")]
    pub exclude_user: UserUser,
    pub filter: String,
    #[serde(rename = "longParam")]
    pub long_param: i64,
    #[serde(rename = "bigIntParam")]
    pub big_int_param: num_bigint::BigInt,
}
