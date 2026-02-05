pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithDuplicativeDiscriminants {
        #[serde(rename = "firstItemType")]
        FirstItemType {
            #[serde(flatten)]
            data: FirstItemType,
        },

        #[serde(rename = "secondItemType")]
        SecondItemType {
            #[serde(flatten)]
            data: SecondItemType,
        },
}
