pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2FunctionSignatureTwoType {
    #[serde(rename = "voidThatTakesActualResult")]
    VoidThatTakesActualResult,
}
impl fmt::Display for V2FunctionSignatureTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::VoidThatTakesActualResult => "voidThatTakesActualResult",
        };
        write!(f, "{}", s)
    }
}
