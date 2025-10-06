pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnknownStatus {
    Known,
    Unknown,
}
impl fmt::Display for UnknownStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Known => "Known",
            Self::Unknown => "Unknown",
        };
        write!(f, "{}", s)
    }
}
