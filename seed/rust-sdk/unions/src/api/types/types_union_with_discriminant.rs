pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "_type")]
pub enum UnionWithDiscriminant {
    Foo { foo: Foo },

    Bar { bar: Bar },
}
