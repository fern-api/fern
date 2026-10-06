pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ItemNotFound {
    #[serde(default)]
    pub item_id: String,
}

impl ItemNotFound {
    pub fn builder() -> ItemNotFoundBuilder {
        <ItemNotFoundBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ItemNotFoundBuilder {
    item_id: Option<String>,
}

impl ItemNotFoundBuilder {
    pub fn item_id(mut self, value: impl Into<String>) -> Self {
        self.item_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ItemNotFound`].
    /// This method will fail if any of the following fields are not set:
    /// - [`item_id`](ItemNotFoundBuilder::item_id)
    pub fn build(self) -> Result<ItemNotFound, BuildError> {
        Ok(ItemNotFound {
            item_id: self.item_id.ok_or_else(|| BuildError::missing_field("item_id"))?,
        })
    }
}
