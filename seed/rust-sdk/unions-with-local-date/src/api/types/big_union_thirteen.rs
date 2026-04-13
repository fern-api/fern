pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionThirteen {
    #[serde(flatten)]
    pub rotating_ratio_fields: RotatingRatio,
    pub r#type: BigUnionThirteenType,
}

impl BigUnionThirteen {
    pub fn builder() -> BigUnionThirteenBuilder {
        <BigUnionThirteenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionThirteenBuilder {
    rotating_ratio_fields: Option<RotatingRatio>,
    r#type: Option<BigUnionThirteenType>,
}

impl BigUnionThirteenBuilder {
    pub fn rotating_ratio_fields(mut self, value: RotatingRatio) -> Self {
        self.rotating_ratio_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionThirteenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionThirteen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`rotating_ratio_fields`](BigUnionThirteenBuilder::rotating_ratio_fields)
    /// - [`r#type`](BigUnionThirteenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionThirteen, BuildError> {
        Ok(BigUnionThirteen {
            rotating_ratio_fields: self
                .rotating_ratio_fields
                .ok_or_else(|| BuildError::missing_field("rotating_ratio_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
