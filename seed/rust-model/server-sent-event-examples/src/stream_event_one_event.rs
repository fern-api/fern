pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum StreamEventOneEvent {
    #[serde(rename = "error")]
    Error,
}
impl fmt::Display for StreamEventOneEvent {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Error => "error",
        };
        write!(f, "{}", s)
    }
}
