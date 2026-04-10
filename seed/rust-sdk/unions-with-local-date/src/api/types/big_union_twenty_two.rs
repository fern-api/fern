pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwentyTwo {
    #[serde(flatten)]
    pub diligent_deal_fields: DiligentDeal,
    pub r#type: BigUnionTwentyTwoType,
}

impl BigUnionTwentyTwo {
    pub fn builder() -> BigUnionTwentyTwoBuilder {
        <BigUnionTwentyTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwentyTwoBuilder {
    diligent_deal_fields: Option<DiligentDeal>,
    r#type: Option<BigUnionTwentyTwoType>,
}

impl BigUnionTwentyTwoBuilder {
    pub fn diligent_deal_fields(mut self, value: DiligentDeal) -> Self {
        self.diligent_deal_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwentyTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwentyTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`diligent_deal_fields`](BigUnionTwentyTwoBuilder::diligent_deal_fields)
    /// - [`r#type`](BigUnionTwentyTwoBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwentyTwo, BuildError> {
        Ok(BigUnionTwentyTwo {
            diligent_deal_fields: self
                .diligent_deal_fields
                .ok_or_else(|| BuildError::missing_field("diligent_deal_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
