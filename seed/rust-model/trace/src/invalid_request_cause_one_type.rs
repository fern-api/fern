pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum InvalidRequestCauseOneType {
    #[serde(rename = "customTestCasesUnsupported")]
    CustomTestCasesUnsupported,
}
impl fmt::Display for InvalidRequestCauseOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::CustomTestCasesUnsupported => "customTestCasesUnsupported",
        };
        write!(f, "{}", s)
    }
}
