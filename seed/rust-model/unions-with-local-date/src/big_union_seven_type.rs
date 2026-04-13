pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BigUnionSevenType {
    #[serde(rename = "limpingStep")]
    LimpingStep,
}
impl fmt::Display for BigUnionSevenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::LimpingStep => "limpingStep",
        };
        write!(f, "{}", s)
    }
}
