pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithOptionalReference {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo { value: Option<Foo> },

    #[serde(rename = "bar")]
    #[non_exhaustive]
    Bar { value: Option<Bar> },
}

impl UnionWithOptionalReference {
    pub fn foo(value: Option<Foo>) -> Self {
        Self::Foo { value }
    }

    pub fn bar(value: Option<Bar>) -> Self {
        Self::Bar { value }
    }
}
