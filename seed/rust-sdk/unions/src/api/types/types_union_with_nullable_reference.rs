pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithNullableReference {
    #[serde(rename = "foo")]
    #[non_exhaustive]
    Foo { value: Option<Foo> },

    #[serde(rename = "bar")]
    #[non_exhaustive]
    Bar { value: Option<Bar> },
}

impl UnionWithNullableReference {
    pub fn foo(value: Option<Foo>) -> Self {
        Self::Foo { value }
    }

    pub fn bar(value: Option<Bar>) -> Self {
        Self::Bar { value }
    }
}
