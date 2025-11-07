pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetUsernameQueryRequest {
    pub limit: i64,
    pub id: Uuid,
    pub date: NaiveDate,
    pub deadline: DateTime<Utc>,
    pub bytes: Vec<u8>,
    pub user: User,
    #[serde(rename = "userList")]
    pub user_list: Vec<User>,
    #[serde(rename = "optionalDeadline")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_deadline: Option<DateTime<Utc>>,
    #[serde(rename = "keyValue")]
    pub key_value: HashMap<String, String>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "nestedUser")]
    pub nested_user: NestedUser,
    #[serde(rename = "optionalUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_user: Option<User>,
    #[serde(rename = "excludeUser")]
    pub exclude_user: User,
    pub filter: String,
}
