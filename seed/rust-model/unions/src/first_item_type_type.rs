pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum FirstItemTypeType {
    #[serde(rename = "firstItemType")]
    FirstItemType,
}
impl fmt::Display for FirstItemTypeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::FirstItemType => "firstItemType",
        };
        write!(f, "{}", s)
    }
}
