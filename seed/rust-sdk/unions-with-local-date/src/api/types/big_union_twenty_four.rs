pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwentyFour {
    #[serde(flatten)]
    pub hoarse_mouse_fields: HoarseMouse,
    pub r#type: BigUnionTwentyFourType,
}

impl BigUnionTwentyFour {
    pub fn builder() -> BigUnionTwentyFourBuilder {
        <BigUnionTwentyFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwentyFourBuilder {
    hoarse_mouse_fields: Option<HoarseMouse>,
    r#type: Option<BigUnionTwentyFourType>,
}

impl BigUnionTwentyFourBuilder {
    pub fn hoarse_mouse_fields(mut self, value: HoarseMouse) -> Self {
        self.hoarse_mouse_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwentyFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwentyFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`hoarse_mouse_fields`](BigUnionTwentyFourBuilder::hoarse_mouse_fields)
    /// - [`r#type`](BigUnionTwentyFourBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwentyFour, BuildError> {
        Ok(BigUnionTwentyFour {
            hoarse_mouse_fields: self
                .hoarse_mouse_fields
                .ok_or_else(|| BuildError::missing_field("hoarse_mouse_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
