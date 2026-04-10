pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionFour {
    #[serde(flatten)]
    pub misty_snow_fields: MistySnow,
    pub r#type: BigUnionFourType,
}

impl BigUnionFour {
    pub fn builder() -> BigUnionFourBuilder {
        <BigUnionFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionFourBuilder {
    misty_snow_fields: Option<MistySnow>,
    r#type: Option<BigUnionFourType>,
}

impl BigUnionFourBuilder {
    pub fn misty_snow_fields(mut self, value: MistySnow) -> Self {
        self.misty_snow_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`misty_snow_fields`](BigUnionFourBuilder::misty_snow_fields)
    /// - [`r#type`](BigUnionFourBuilder::r#type)
    pub fn build(self) -> Result<BigUnionFour, BuildError> {
        Ok(BigUnionFour {
            misty_snow_fields: self
                .misty_snow_fields
                .ok_or_else(|| BuildError::missing_field("misty_snow_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
