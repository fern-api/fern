pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct CreateMovieRequest {
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub rating: f64,
}
