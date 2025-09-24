use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateMovieRequest {
    pub title: String,
    pub rating: f64,
}
