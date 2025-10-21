pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum FileInfo {
    /// A regular file (e.g. foo.txt).
    #[serde(rename = "REGULAR")]
    Regular,
    /// A directory (e.g. foo/).
    #[serde(rename = "DIRECTORY")]
    Directory,
}
impl fmt::Display for FileInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Regular => "REGULAR",
            Self::Directory => "DIRECTORY",
        };
        write!(f, "{}", s)
    }
}
