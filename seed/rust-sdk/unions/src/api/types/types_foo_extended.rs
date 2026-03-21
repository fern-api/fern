pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FooExtended {
    #[serde(flatten)]
    pub foo_fields: Foo,
    #[serde(default)]
    pub age: i64,
}
