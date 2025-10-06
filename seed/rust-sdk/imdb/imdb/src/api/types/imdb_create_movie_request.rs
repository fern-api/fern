pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ImdbCreateMovieRequest {
    pub title: String,
    pub rating: f64,
}
