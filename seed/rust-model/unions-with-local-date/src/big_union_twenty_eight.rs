pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwentyEight {
    #[serde(flatten)]
    pub gaseous_road_fields: GaseousRoad,
    pub r#type: BigUnionTwentyEightType,
}

impl BigUnionTwentyEight {
    pub fn builder() -> BigUnionTwentyEightBuilder {
        <BigUnionTwentyEightBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwentyEightBuilder {
    gaseous_road_fields: Option<GaseousRoad>,
    r#type: Option<BigUnionTwentyEightType>,
}

impl BigUnionTwentyEightBuilder {
    pub fn gaseous_road_fields(mut self, value: GaseousRoad) -> Self {
        self.gaseous_road_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwentyEightType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwentyEight`].
    /// This method will fail if any of the following fields are not set:
    /// - [`gaseous_road_fields`](BigUnionTwentyEightBuilder::gaseous_road_fields)
    /// - [`r#type`](BigUnionTwentyEightBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwentyEight, BuildError> {
        Ok(BigUnionTwentyEight {
            gaseous_road_fields: self.gaseous_road_fields.ok_or_else(|| BuildError::missing_field("gaseous_road_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
