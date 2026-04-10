pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ActualResultOneType {
    #[serde(rename = "exception")]
    Exception,
}
impl fmt::Display for ActualResultOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Exception => "exception",
        };
        write!(f, "{}", s)
    }
}
