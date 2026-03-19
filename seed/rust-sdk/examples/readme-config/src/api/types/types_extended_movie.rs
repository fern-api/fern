pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ExtendedMovie {
    #[serde(flatten)]
    pub movie_fields: Movie,
    #[serde(default)]
    pub cast: Vec<String>,
}
