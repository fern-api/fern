pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Union {
    Foo { foo: Foo },

    Bar { bar: Bar },
}
