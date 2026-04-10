pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionFifteen {
    #[serde(flatten)]
    pub disloyal_value_fields: DisloyalValue,
    pub r#type: BigUnionFifteenType,
}

impl BigUnionFifteen {
    pub fn builder() -> BigUnionFifteenBuilder {
        <BigUnionFifteenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionFifteenBuilder {
    disloyal_value_fields: Option<DisloyalValue>,
    r#type: Option<BigUnionFifteenType>,
}

impl BigUnionFifteenBuilder {
    pub fn disloyal_value_fields(mut self, value: DisloyalValue) -> Self {
        self.disloyal_value_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionFifteenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionFifteen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`disloyal_value_fields`](BigUnionFifteenBuilder::disloyal_value_fields)
    /// - [`r#type`](BigUnionFifteenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionFifteen, BuildError> {
        Ok(BigUnionFifteen {
            disloyal_value_fields: self.disloyal_value_fields.ok_or_else(|| BuildError::missing_field("disloyal_value_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
