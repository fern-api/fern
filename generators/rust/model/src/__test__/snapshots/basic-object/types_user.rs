pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct User {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
    #[serde(default)]
    pub is_active: bool,
    #[serde(default)]
    pub balance: f64,
    #[serde(default)]
    pub tags: Vec<String>,
}