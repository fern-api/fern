pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum OpenEnumType {
    #[serde(rename = "OPTION_A")]
    OptionA,
    #[serde(rename = "OPTION_B")]
    OptionB,
    #[serde(rename = "OPTION_C")]
    OptionC,
}
impl fmt::Display for OpenEnumType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::OptionA => "OPTION_A",
            Self::OptionB => "OPTION_B",
            Self::OptionC => "OPTION_C",
        };
        write!(f, "{}", s)
    }
}
