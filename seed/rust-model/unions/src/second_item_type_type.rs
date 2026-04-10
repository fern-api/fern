pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SecondItemTypeType {
    #[serde(rename = "secondItemType")]
    SecondItemType,
}
impl fmt::Display for SecondItemTypeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::SecondItemType => "secondItemType",
        };
        write!(f, "{}", s)
    }
}
