pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CursorPagesType {
    #[serde(rename = "pages")]
    Pages,
}
impl fmt::Display for CursorPagesType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Pages => "pages",
        };
        write!(f, "{}", s)
    }
}
