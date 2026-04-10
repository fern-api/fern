pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwentyFive {
    #[serde(flatten)]
    pub circular_card_fields: CircularCard,
    pub r#type: BigUnionTwentyFiveType,
}

impl BigUnionTwentyFive {
    pub fn builder() -> BigUnionTwentyFiveBuilder {
        <BigUnionTwentyFiveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwentyFiveBuilder {
    circular_card_fields: Option<CircularCard>,
    r#type: Option<BigUnionTwentyFiveType>,
}

impl BigUnionTwentyFiveBuilder {
    pub fn circular_card_fields(mut self, value: CircularCard) -> Self {
        self.circular_card_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwentyFiveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwentyFive`].
    /// This method will fail if any of the following fields are not set:
    /// - [`circular_card_fields`](BigUnionTwentyFiveBuilder::circular_card_fields)
    /// - [`r#type`](BigUnionTwentyFiveBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwentyFive, BuildError> {
        Ok(BigUnionTwentyFive {
            circular_card_fields: self
                .circular_card_fields
                .ok_or_else(|| BuildError::missing_field("circular_card_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
