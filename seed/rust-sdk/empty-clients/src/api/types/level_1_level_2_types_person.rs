pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Person {
    #[serde(default)]
    pub name: String,
    pub address: Address,
}

impl Person {
    pub fn builder() -> PersonBuilder {
        PersonBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PersonBuilder {
    name: Option<String>,
    address: Option<Address>,
}

impl PersonBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn address(mut self, value: Address) -> Self {
        self.address = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Person`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](PersonBuilder::name)
    /// - [`address`](PersonBuilder::address)
    pub fn build(self) -> Result<Person, BuildError> {
        Ok(Person {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            address: self
                .address
                .ok_or_else(|| BuildError::missing_field("address"))?,
        })
    }
}
