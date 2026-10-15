pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ModelsOrderRequestShipTo {
    #[serde(default)]
    pub line1: String,
    #[serde(default)]
    pub city: String,
}

impl ModelsOrderRequestShipTo {
    pub fn builder() -> ModelsOrderRequestShipToBuilder {
        <ModelsOrderRequestShipToBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ModelsOrderRequestShipToBuilder {
    line1: Option<String>,
    city: Option<String>,
}

impl ModelsOrderRequestShipToBuilder {
    pub fn line1(mut self, value: impl Into<String>) -> Self {
        self.line1 = Some(value.into());
        self
    }

    pub fn city(mut self, value: impl Into<String>) -> Self {
        self.city = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ModelsOrderRequestShipTo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`line1`](ModelsOrderRequestShipToBuilder::line1)
    /// - [`city`](ModelsOrderRequestShipToBuilder::city)
    pub fn build(self) -> Result<ModelsOrderRequestShipTo, BuildError> {
        Ok(ModelsOrderRequestShipTo {
            line1: self.line1.ok_or_else(|| BuildError::missing_field("line1"))?,
            city: self.city.ok_or_else(|| BuildError::missing_field("city"))?,
        })
    }
}
