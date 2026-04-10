pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Level1Level2Address {
    #[serde(default)]
    pub line1: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line2: Option<String>,
    #[serde(default)]
    pub city: String,
    #[serde(default)]
    pub state: String,
    #[serde(default)]
    pub zip: String,
    pub country: Level1Level2AddressCountry,
}

impl Level1Level2Address {
    pub fn builder() -> Level1Level2AddressBuilder {
        <Level1Level2AddressBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Level1Level2AddressBuilder {
    line1: Option<String>,
    line2: Option<String>,
    city: Option<String>,
    state: Option<String>,
    zip: Option<String>,
    country: Option<Level1Level2AddressCountry>,
}

impl Level1Level2AddressBuilder {
    pub fn line1(mut self, value: impl Into<String>) -> Self {
        self.line1 = Some(value.into());
        self
    }

    pub fn line2(mut self, value: impl Into<String>) -> Self {
        self.line2 = Some(value.into());
        self
    }

    pub fn city(mut self, value: impl Into<String>) -> Self {
        self.city = Some(value.into());
        self
    }

    pub fn state(mut self, value: impl Into<String>) -> Self {
        self.state = Some(value.into());
        self
    }

    pub fn zip(mut self, value: impl Into<String>) -> Self {
        self.zip = Some(value.into());
        self
    }

    pub fn country(mut self, value: Level1Level2AddressCountry) -> Self {
        self.country = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Level1Level2Address`].
    /// This method will fail if any of the following fields are not set:
    /// - [`line1`](Level1Level2AddressBuilder::line1)
    /// - [`city`](Level1Level2AddressBuilder::city)
    /// - [`state`](Level1Level2AddressBuilder::state)
    /// - [`zip`](Level1Level2AddressBuilder::zip)
    /// - [`country`](Level1Level2AddressBuilder::country)
    pub fn build(self) -> Result<Level1Level2Address, BuildError> {
        Ok(Level1Level2Address {
            line1: self.line1.ok_or_else(|| BuildError::missing_field("line1"))?,
            line2: self.line2,
            city: self.city.ok_or_else(|| BuildError::missing_field("city"))?,
            state: self.state.ok_or_else(|| BuildError::missing_field("state"))?,
            zip: self.zip.ok_or_else(|| BuildError::missing_field("zip"))?,
            country: self.country.ok_or_else(|| BuildError::missing_field("country"))?,
        })
    }
}
