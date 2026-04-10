pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionZero {
    #[serde(flatten)]
    pub normal_sweet_fields: NormalSweet,
    pub r#type: BigUnionZeroType,
}

impl BigUnionZero {
    pub fn builder() -> BigUnionZeroBuilder {
        <BigUnionZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionZeroBuilder {
    normal_sweet_fields: Option<NormalSweet>,
    r#type: Option<BigUnionZeroType>,
}

impl BigUnionZeroBuilder {
    pub fn normal_sweet_fields(mut self, value: NormalSweet) -> Self {
        self.normal_sweet_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`normal_sweet_fields`](BigUnionZeroBuilder::normal_sweet_fields)
    /// - [`r#type`](BigUnionZeroBuilder::r#type)
    pub fn build(self) -> Result<BigUnionZero, BuildError> {
        Ok(BigUnionZero {
            normal_sweet_fields: self
                .normal_sweet_fields
                .ok_or_else(|| BuildError::missing_field("normal_sweet_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
