pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Foo2 {
    #[serde(default)]
    pub bar_property: Uuid,
}