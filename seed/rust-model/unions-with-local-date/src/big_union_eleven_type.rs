pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionElevenType {
    #[serde(rename = "falseMirror")]
    FalseMirror,
}
impl fmt::Display for BigUnionElevenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::FalseMirror => "falseMirror",
        };
        write!(f, "{}", s)
    }
}
