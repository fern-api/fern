use crate::client::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PaginatedClientResponse {
    pub start: i32,
    pub limit: i32,
    pub length: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<i32>,
    pub clients: Vec<Client>,
}