pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Level1Person {
    #[serde(default)]
    pub name: String,
    pub address: Level1Address,
}

impl Level1Person {
    pub fn builder() -> Level1PersonBuilder {
        <Level1PersonBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Level1PersonBuilder {
    name: Option<String>,
    address: Option<Level1Address>,
}

impl Level1PersonBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn address(mut self, value: Level1Address) -> Self {
        self.address = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Level1Person`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](Level1PersonBuilder::name)
    /// - [`address`](Level1PersonBuilder::address)
    pub fn build(self) -> Result<Level1Person, BuildError> {
        Ok(Level1Person {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            address: self
                .address
                .ok_or_else(|| BuildError::missing_field("address"))?,
        })
    }
}
