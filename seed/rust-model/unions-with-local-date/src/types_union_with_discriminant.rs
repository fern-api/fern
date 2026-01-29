pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "_type")]
pub enum UnionWithDiscriminant {
        #[serde(rename = "foo")]
        Foo {
            foo: Foo,
        },

        #[serde(rename = "bar")]
        Bar {
            bar: Bar,
        },
}
