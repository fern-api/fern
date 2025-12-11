pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithDuplicativeDiscriminants {
    FirstItemType {
        #[serde(flatten)]
        data: FirstItemType,
    },

    SecondItemType {
        #[serde(flatten)]
        data: SecondItemType,
    },
}
