pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionOne {
    #[serde(flatten)]
    pub thankful_factor_fields: ThankfulFactor,
    pub r#type: BigUnionOneType,
}

impl BigUnionOne {
    pub fn builder() -> BigUnionOneBuilder {
        <BigUnionOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionOneBuilder {
    thankful_factor_fields: Option<ThankfulFactor>,
    r#type: Option<BigUnionOneType>,
}

impl BigUnionOneBuilder {
    pub fn thankful_factor_fields(mut self, value: ThankfulFactor) -> Self {
        self.thankful_factor_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`thankful_factor_fields`](BigUnionOneBuilder::thankful_factor_fields)
    /// - [`r#type`](BigUnionOneBuilder::r#type)
    pub fn build(self) -> Result<BigUnionOne, BuildError> {
        Ok(BigUnionOne {
            thankful_factor_fields: self
                .thankful_factor_fields
                .ok_or_else(|| BuildError::missing_field("thankful_factor_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
