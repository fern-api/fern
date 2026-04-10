pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum NotFoundErrorBodyErrorName {
    PlaylistIdNotFoundError,
}
impl fmt::Display for NotFoundErrorBodyErrorName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::PlaylistIdNotFoundError => "PlaylistIdNotFoundError",
        };
        write!(f, "{}", s)
    }
}
