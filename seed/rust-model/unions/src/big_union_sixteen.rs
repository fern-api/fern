pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionSixteen {
    #[serde(flatten)]
    pub gruesome_coach_fields: GruesomeCoach,
    pub r#type: BigUnionSixteenType,
}

impl BigUnionSixteen {
    pub fn builder() -> BigUnionSixteenBuilder {
        <BigUnionSixteenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionSixteenBuilder {
    gruesome_coach_fields: Option<GruesomeCoach>,
    r#type: Option<BigUnionSixteenType>,
}

impl BigUnionSixteenBuilder {
    pub fn gruesome_coach_fields(mut self, value: GruesomeCoach) -> Self {
        self.gruesome_coach_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionSixteenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionSixteen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`gruesome_coach_fields`](BigUnionSixteenBuilder::gruesome_coach_fields)
    /// - [`r#type`](BigUnionSixteenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionSixteen, BuildError> {
        Ok(BigUnionSixteen {
            gruesome_coach_fields: self.gruesome_coach_fields.ok_or_else(|| BuildError::missing_field("gruesome_coach_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
