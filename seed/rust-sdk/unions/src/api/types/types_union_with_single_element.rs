pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithSingleElement {
        #[serde(rename = "foo")]
        #[non_exhaustive]
        Foo {
            #[serde(flatten)]
            data: Foo,
        },
}

impl UnionWithSingleElement {
    pub fn foo(data: Foo) -> Self {
        Self::Foo { data }
    }
}
