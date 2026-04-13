pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Level1Level2Person {
    #[serde(default)]
    pub name: String,
    pub address: Level1Level2Address,
}

impl Level1Level2Person {
    pub fn builder() -> Level1Level2PersonBuilder {
        <Level1Level2PersonBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Level1Level2PersonBuilder {
    name: Option<String>,
    address: Option<Level1Level2Address>,
}

impl Level1Level2PersonBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn address(mut self, value: Level1Level2Address) -> Self {
        self.address = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Level1Level2Person`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](Level1Level2PersonBuilder::name)
    /// - [`address`](Level1Level2PersonBuilder::address)
    pub fn build(self) -> Result<Level1Level2Person, BuildError> {
        Ok(Level1Level2Person {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            address: self.address.ok_or_else(|| BuildError::missing_field("address"))?,
        })
    }
}
