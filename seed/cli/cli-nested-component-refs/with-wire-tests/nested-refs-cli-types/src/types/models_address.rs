pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ModelsAddress {
    #[serde(default)]
    pub line1: String,
    #[serde(default)]
    pub city: String,
}

impl ModelsAddress {
    pub fn builder() -> ModelsAddressBuilder {
        <ModelsAddressBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ModelsAddressBuilder {
    line1: Option<String>,
    city: Option<String>,
}

impl ModelsAddressBuilder {
    pub fn line1(mut self, value: impl Into<String>) -> Self {
        self.line1 = Some(value.into());
        self
    }

    pub fn city(mut self, value: impl Into<String>) -> Self {
        self.city = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ModelsAddress`].
    /// This method will fail if any of the following fields are not set:
    /// - [`line1`](ModelsAddressBuilder::line1)
    /// - [`city`](ModelsAddressBuilder::city)
    pub fn build(self) -> Result<ModelsAddress, BuildError> {
        Ok(ModelsAddress {
            line1: self.line1.ok_or_else(|| BuildError::missing_field("line1"))?,
            city: self.city.ok_or_else(|| BuildError::missing_field("city"))?,
        })
    }
}
