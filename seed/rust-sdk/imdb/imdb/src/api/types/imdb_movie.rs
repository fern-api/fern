pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ImdbMovie {
    pub id: ImdbMovieId,
    pub title: String,
    /// The rating scale is one to five stars
    pub rating: f64,
}
