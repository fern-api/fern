use crate::movie_id::MovieId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Movie {
    pub id: MovieId,
    pub title: String,
    pub rating: f64,
}