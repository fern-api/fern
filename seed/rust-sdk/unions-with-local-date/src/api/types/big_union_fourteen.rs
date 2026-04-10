pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionFourteen {
    #[serde(flatten)]
    pub colorful_cover_fields: ColorfulCover,
    pub r#type: BigUnionFourteenType,
}

impl BigUnionFourteen {
    pub fn builder() -> BigUnionFourteenBuilder {
        <BigUnionFourteenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionFourteenBuilder {
    colorful_cover_fields: Option<ColorfulCover>,
    r#type: Option<BigUnionFourteenType>,
}

impl BigUnionFourteenBuilder {
    pub fn colorful_cover_fields(mut self, value: ColorfulCover) -> Self {
        self.colorful_cover_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionFourteenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionFourteen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`colorful_cover_fields`](BigUnionFourteenBuilder::colorful_cover_fields)
    /// - [`r#type`](BigUnionFourteenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionFourteen, BuildError> {
        Ok(BigUnionFourteen {
            colorful_cover_fields: self
                .colorful_cover_fields
                .ok_or_else(|| BuildError::missing_field("colorful_cover_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
