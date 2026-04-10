pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionSeven {
    #[serde(flatten)]
    pub limping_step_fields: LimpingStep,
    pub r#type: BigUnionSevenType,
}

impl BigUnionSeven {
    pub fn builder() -> BigUnionSevenBuilder {
        <BigUnionSevenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionSevenBuilder {
    limping_step_fields: Option<LimpingStep>,
    r#type: Option<BigUnionSevenType>,
}

impl BigUnionSevenBuilder {
    pub fn limping_step_fields(mut self, value: LimpingStep) -> Self {
        self.limping_step_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionSevenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionSeven`].
    /// This method will fail if any of the following fields are not set:
    /// - [`limping_step_fields`](BigUnionSevenBuilder::limping_step_fields)
    /// - [`r#type`](BigUnionSevenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionSeven, BuildError> {
        Ok(BigUnionSeven {
            limping_step_fields: self
                .limping_step_fields
                .ok_or_else(|| BuildError::missing_field("limping_step_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
