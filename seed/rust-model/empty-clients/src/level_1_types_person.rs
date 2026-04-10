pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Person2 {
    #[serde(default)]
    pub name: String,
    pub address: Address2,
}

impl Person2 {
    pub fn builder() -> Person2Builder {
        <Person2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Person2Builder {
    name: Option<String>,
    address: Option<Address2>,
}

impl Person2Builder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn address(mut self, value: Address2) -> Self {
        self.address = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Person2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](Person2Builder::name)
    /// - [`address`](Person2Builder::address)
    pub fn build(self) -> Result<Person2, BuildError> {
        Ok(Person2 {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            address: self.address.ok_or_else(|| BuildError::missing_field("address"))?,
        })
    }
}
