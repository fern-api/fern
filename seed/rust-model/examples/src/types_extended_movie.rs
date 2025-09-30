use crate::types_movie::Movie;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtendedMovie {
    #[serde(flatten)]
    pub movie_fields: Movie,
    pub cast: Vec<String>,
}