pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithSubTypesZeroType {
    #[serde(rename = "foo")]
    Foo,
}
impl fmt::Display for UnionWithSubTypesZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Foo => "foo",
        };
        write!(f, "{}", s)
    }
}
