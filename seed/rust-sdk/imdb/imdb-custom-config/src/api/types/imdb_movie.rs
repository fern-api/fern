pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Movie {
    #[serde(default)]
    pub id: MovieId,
    #[serde(default)]
    pub title: String,
    /// The rating scale is one to five stars
    #[serde(default)]
    pub rating: f64,
}
