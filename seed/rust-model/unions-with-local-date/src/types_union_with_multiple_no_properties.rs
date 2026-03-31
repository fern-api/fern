pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithMultipleNoProperties {
        #[serde(rename = "foo")]
        #[non_exhaustive]
        Foo {
            #[serde(flatten)]
            data: Foo,
        },

        #[serde(rename = "empty1")]
        #[non_exhaustive]
        Empty1 {},

        #[serde(rename = "empty2")]
        #[non_exhaustive]
        Empty2 {},
}

impl UnionWithMultipleNoProperties {
    pub fn foo(data: Foo) -> Self {
        Self::Foo { data }
    }

    pub fn empty_1() -> Self {
        Self::Empty1 {}
    }

    pub fn empty_2() -> Self {
        Self::Empty2 {}
    }
}
