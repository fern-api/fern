pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionEight {
    #[serde(flatten)]
    pub vibrant_excitement_fields: VibrantExcitement,
    pub r#type: BigUnionEightType,
}

impl BigUnionEight {
    pub fn builder() -> BigUnionEightBuilder {
        <BigUnionEightBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionEightBuilder {
    vibrant_excitement_fields: Option<VibrantExcitement>,
    r#type: Option<BigUnionEightType>,
}

impl BigUnionEightBuilder {
    pub fn vibrant_excitement_fields(mut self, value: VibrantExcitement) -> Self {
        self.vibrant_excitement_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionEightType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionEight`].
    /// This method will fail if any of the following fields are not set:
    /// - [`vibrant_excitement_fields`](BigUnionEightBuilder::vibrant_excitement_fields)
    /// - [`r#type`](BigUnionEightBuilder::r#type)
    pub fn build(self) -> Result<BigUnionEight, BuildError> {
        Ok(BigUnionEight {
            vibrant_excitement_fields: self
                .vibrant_excitement_fields
                .ok_or_else(|| BuildError::missing_field("vibrant_excitement_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
