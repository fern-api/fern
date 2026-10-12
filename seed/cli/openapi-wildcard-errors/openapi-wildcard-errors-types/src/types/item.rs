pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Item {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
}

impl Item {
    pub fn builder() -> ItemBuilder {
        <ItemBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ItemBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl ItemBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Item`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](ItemBuilder::id)
    /// - [`name`](ItemBuilder::name)
    pub fn build(self) -> Result<Item, BuildError> {
        Ok(Item {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
