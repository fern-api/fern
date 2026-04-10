pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ActualResultTwoType {
    #[serde(rename = "exceptionV2")]
    ExceptionV2,
}
impl fmt::Display for ActualResultTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ExceptionV2 => "exceptionV2",
        };
        write!(f, "{}", s)
    }
}
