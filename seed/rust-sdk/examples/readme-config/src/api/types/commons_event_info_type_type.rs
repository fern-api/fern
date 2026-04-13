pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CommonsEventInfoTypeType {
    #[serde(rename = "tag")]
    Tag,
}
impl fmt::Display for CommonsEventInfoTypeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Tag => "tag",
        };
        write!(f, "{}", s)
    }
}
