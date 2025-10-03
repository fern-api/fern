pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Movie {
    pub id: MovieId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prequel: Option<MovieId>,
    pub title: String,
    pub from: String,
    /// The rating scale is one to five stars
    pub rating: f64,
    pub r#type: String,
    pub tag: Tag,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub book: Option<String>,
    pub metadata: HashMap<String, serde_json::Value>,
    pub revenue: i64,
}