pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Union {
        #[serde(rename = "foo")]
        Foo {
            foo: Foo,
        },

        #[serde(rename = "bar")]
        Bar {
            bar: Bar,
        },
}
