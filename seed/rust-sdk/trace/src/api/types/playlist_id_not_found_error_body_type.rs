pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum PlaylistIdNotFoundErrorBodyType {
    #[serde(rename = "playlistId")]
    PlaylistId,
}
impl fmt::Display for PlaylistIdNotFoundErrorBodyType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::PlaylistId => "playlistId",
        };
        write!(f, "{}", s)
    }
}
