use crate::user_user::User;
use crate::user_nested_user::NestedUser;
use chrono::{DateTime, NaiveDate, Utc};
use std::collections::HashMap;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetUsernameQueryRequest {
    pub limit: i32,
    pub id: uuid::Uuid,
    pub date: NaiveDate,
    pub deadline: DateTime<Utc>,
    pub bytes: String,
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
    #[serde(rename = "longParam")]
    pub long_param: i64,
    #[serde(rename = "bigIntParam")]
    pub big_int_param: num_bigint::BigInt,
}