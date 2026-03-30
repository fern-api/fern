pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Address2 {
    #[serde(rename = "line1")]
    #[serde(default)]
    pub line_1: String,
    #[serde(rename = "line2")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line_2: Option<String>,
    #[serde(default)]
    pub city: String,
    #[serde(default)]
    pub state: String,
    #[serde(default)]
    pub zip: String,
    pub country: String,
}

impl Address2 {
    pub fn builder() -> Address2Builder {
        <Address2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct Address2Builder {
    line_1: Option<String>,
    line_2: Option<String>,
    city: Option<String>,
    state: Option<String>,
    zip: Option<String>,
    country: Option<String>,
}

impl Address2Builder {
    pub fn line_1(mut self, value: impl Into<String>) -> Self {
        self.line_1 = Some(value.into());
        self
    }

    pub fn line_2(mut self, value: impl Into<String>) -> Self {
        self.line_2 = Some(value.into());
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

    pub fn country(mut self, value: impl Into<String>) -> Self {
        self.country = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Address2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`line_1`](Address2Builder::line_1)
    /// - [`city`](Address2Builder::city)
    /// - [`state`](Address2Builder::state)
    /// - [`zip`](Address2Builder::zip)
    /// - [`country`](Address2Builder::country)
    pub fn build(self) -> Result<Address2, BuildError> {
        Ok(Address2 {
            line_1: self.line_1.ok_or_else(|| BuildError::missing_field("line_1"))?,
            line_2: self.line_2,
            city: self.city.ok_or_else(|| BuildError::missing_field("city"))?,
            state: self.state.ok_or_else(|| BuildError::missing_field("state"))?,
            zip: self.zip.ok_or_else(|| BuildError::missing_field("zip"))?,
            country: self.country.ok_or_else(|| BuildError::missing_field("country"))?,
        })
    }
}
