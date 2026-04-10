pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionNineteen {
    #[serde(flatten)]
    pub unique_stress_fields: UniqueStress,
    pub r#type: BigUnionNineteenType,
}

impl BigUnionNineteen {
    pub fn builder() -> BigUnionNineteenBuilder {
        <BigUnionNineteenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionNineteenBuilder {
    unique_stress_fields: Option<UniqueStress>,
    r#type: Option<BigUnionNineteenType>,
}

impl BigUnionNineteenBuilder {
    pub fn unique_stress_fields(mut self, value: UniqueStress) -> Self {
        self.unique_stress_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionNineteenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionNineteen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`unique_stress_fields`](BigUnionNineteenBuilder::unique_stress_fields)
    /// - [`r#type`](BigUnionNineteenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionNineteen, BuildError> {
        Ok(BigUnionNineteen {
            unique_stress_fields: self.unique_stress_fields.ok_or_else(|| BuildError::missing_field("unique_stress_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
