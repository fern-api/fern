pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CommonsEventInfoZeroType {
    #[serde(rename = "metadata")]
    Metadata,
}
impl fmt::Display for CommonsEventInfoZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Metadata => "metadata",
        };
        write!(f, "{}", s)
    }
}
