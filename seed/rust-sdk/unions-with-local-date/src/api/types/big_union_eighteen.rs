pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionEighteen {
    #[serde(flatten)]
    pub harmonious_play_fields: HarmoniousPlay,
    pub r#type: BigUnionEighteenType,
}

impl BigUnionEighteen {
    pub fn builder() -> BigUnionEighteenBuilder {
        <BigUnionEighteenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionEighteenBuilder {
    harmonious_play_fields: Option<HarmoniousPlay>,
    r#type: Option<BigUnionEighteenType>,
}

impl BigUnionEighteenBuilder {
    pub fn harmonious_play_fields(mut self, value: HarmoniousPlay) -> Self {
        self.harmonious_play_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionEighteenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionEighteen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`harmonious_play_fields`](BigUnionEighteenBuilder::harmonious_play_fields)
    /// - [`r#type`](BigUnionEighteenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionEighteen, BuildError> {
        Ok(BigUnionEighteen {
            harmonious_play_fields: self
                .harmonious_play_fields
                .ok_or_else(|| BuildError::missing_field("harmonious_play_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
