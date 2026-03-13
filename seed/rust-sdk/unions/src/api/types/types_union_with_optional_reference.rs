pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithOptionalReference {
    #[serde(rename = "foo")]
    Foo { value: Option<Foo> },

    #[serde(rename = "bar")]
    Bar { value: Option<Bar> },
}
