pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Movie {
    #[serde(default)]
    pub id: MovieId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prequel: Option<MovieId>,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub from: String,
    /// The rating scale is one to five stars
    #[serde(default)]
    pub rating: f64,
    pub r#type: String,
    #[serde(default)]
    pub tag: Tag,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub book: Option<String>,
    #[serde(default)]
    pub metadata: HashMap<String, serde_json::Value>,
    #[serde(default)]
    pub revenue: i64,
}