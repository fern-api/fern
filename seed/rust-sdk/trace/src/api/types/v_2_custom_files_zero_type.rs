pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2CustomFilesZeroType {
    #[serde(rename = "basic")]
    Basic,
}
impl fmt::Display for V2CustomFilesZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Basic => "basic",
        };
        write!(f, "{}", s)
    }
}
