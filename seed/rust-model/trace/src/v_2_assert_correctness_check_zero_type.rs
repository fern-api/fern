pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum V2AssertCorrectnessCheckZeroType {
    #[serde(rename = "deepEquality")]
    DeepEquality,
}
impl fmt::Display for V2AssertCorrectnessCheckZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::DeepEquality => "deepEquality",
        };
        write!(f, "{}", s)
    }
}
