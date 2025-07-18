use serde::{Deserialize, Serialize};

pub type MovieId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Movie {
    pub id: String, // TODO: Implement proper type
    pub title: String, // TODO: Implement proper type
    pub rating: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateMovieRequest {
    pub title: String, // TODO: Implement proper type
    pub rating: String, // TODO: Implement proper type
}

