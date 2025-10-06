pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesExtendedMovie {
    #[serde(flatten)]
    pub movie_fields: TypesMovie,
    pub cast: Vec<String>,
}
