pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateMovieRequest {
    pub title: String,
    pub rating: f64,
}
