pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum KeyOne {
    #[serde(rename = "default")]
    Default,
}
impl fmt::Display for KeyOne {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Default => "default",
        };
        write!(f, "{}", s)
    }
}
