use crate::nested_user::NestedUser;
use crate::search_request_neighbor::SearchRequestNeighbor;
use crate::search_request_neighbor_required::SearchRequestNeighborRequired;
use crate::user::User;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQueryRequest {
    pub limit: i32,
    pub id: String,
    pub date: String,
    pub deadline: DateTime<Utc>,
    pub bytes: String,
    pub user: User,
    #[serde(rename = "userList")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_list: Option<User>,
    #[serde(rename = "optionalDeadline")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_deadline: Option<DateTime<Utc>>,
    #[serde(rename = "keyValue")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key_value: Option<HashMap<String, Option<String>>>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "nestedUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nested_user: Option<NestedUser>,
    #[serde(rename = "optionalUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_user: Option<User>,
    #[serde(rename = "excludeUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exclude_user: Option<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filter: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub neighbor: Option<SearchRequestNeighbor>,
    #[serde(rename = "neighborRequired")]
    pub neighbor_required: SearchRequestNeighborRequired,
}
