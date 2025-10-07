pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesUser {
    pub id: String,
    pub name: String,
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
    pub is_active: bool,
    pub balance: f64,
    pub tags: Vec<String>,
}