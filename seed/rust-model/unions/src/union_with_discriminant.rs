use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "_type")]
pub enum UnionWithDiscriminant {
        Foo {
            foo: Foo,
        },

        Bar {
            bar: Bar,
        },
}
