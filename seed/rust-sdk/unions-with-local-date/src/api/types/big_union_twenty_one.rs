pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwentyOne {
    #[serde(flatten)]
    pub frozen_sleep_fields: FrozenSleep,
    pub r#type: BigUnionTwentyOneType,
}

impl BigUnionTwentyOne {
    pub fn builder() -> BigUnionTwentyOneBuilder {
        <BigUnionTwentyOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwentyOneBuilder {
    frozen_sleep_fields: Option<FrozenSleep>,
    r#type: Option<BigUnionTwentyOneType>,
}

impl BigUnionTwentyOneBuilder {
    pub fn frozen_sleep_fields(mut self, value: FrozenSleep) -> Self {
        self.frozen_sleep_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwentyOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwentyOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`frozen_sleep_fields`](BigUnionTwentyOneBuilder::frozen_sleep_fields)
    /// - [`r#type`](BigUnionTwentyOneBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwentyOne, BuildError> {
        Ok(BigUnionTwentyOne {
            frozen_sleep_fields: self
                .frozen_sleep_fields
                .ok_or_else(|| BuildError::missing_field("frozen_sleep_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
