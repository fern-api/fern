use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct User {
    pub name: String,
    pub id: UserId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Option<Metadata>>,
    pub email: Email,
    #[serde(rename = "favorite-number")]
    pub favorite_number: WeirdNumber,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub numbers: Option<Option<Vec<i32>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub strings: Option<Option<HashMap<String, serde_json::Value>>>,
}