pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionThree {
    #[serde(flatten)]
    pub hasty_pain_fields: HastyPain,
    pub r#type: BigUnionThreeType,
}

impl BigUnionThree {
    pub fn builder() -> BigUnionThreeBuilder {
        <BigUnionThreeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionThreeBuilder {
    hasty_pain_fields: Option<HastyPain>,
    r#type: Option<BigUnionThreeType>,
}

impl BigUnionThreeBuilder {
    pub fn hasty_pain_fields(mut self, value: HastyPain) -> Self {
        self.hasty_pain_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionThreeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionThree`].
    /// This method will fail if any of the following fields are not set:
    /// - [`hasty_pain_fields`](BigUnionThreeBuilder::hasty_pain_fields)
    /// - [`r#type`](BigUnionThreeBuilder::r#type)
    pub fn build(self) -> Result<BigUnionThree, BuildError> {
        Ok(BigUnionThree {
            hasty_pain_fields: self.hasty_pain_fields.ok_or_else(|| BuildError::missing_field("hasty_pain_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
