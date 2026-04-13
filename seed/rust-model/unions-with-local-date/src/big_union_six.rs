pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionSix {
    #[serde(flatten)]
    pub practical_principle_fields: PracticalPrinciple,
    pub r#type: BigUnionSixType,
}

impl BigUnionSix {
    pub fn builder() -> BigUnionSixBuilder {
        <BigUnionSixBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionSixBuilder {
    practical_principle_fields: Option<PracticalPrinciple>,
    r#type: Option<BigUnionSixType>,
}

impl BigUnionSixBuilder {
    pub fn practical_principle_fields(mut self, value: PracticalPrinciple) -> Self {
        self.practical_principle_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionSixType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionSix`].
    /// This method will fail if any of the following fields are not set:
    /// - [`practical_principle_fields`](BigUnionSixBuilder::practical_principle_fields)
    /// - [`r#type`](BigUnionSixBuilder::r#type)
    pub fn build(self) -> Result<BigUnionSix, BuildError> {
        Ok(BigUnionSix {
            practical_principle_fields: self.practical_principle_fields.ok_or_else(|| BuildError::missing_field("practical_principle_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
