pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum MovieType {
    #[serde(rename = "movie")]
    Movie,
}
impl fmt::Display for MovieType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Movie => "movie",
        };
        write!(f, "{}", s)
    }
}
