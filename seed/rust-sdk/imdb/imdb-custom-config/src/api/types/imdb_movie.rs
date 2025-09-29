use crate::imdb_movie_id::MovieId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Movie {
    pub id: MovieId,
    pub title: String,
    /// The rating scale is one to five stars
    pub rating: f64,
}
