pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwenty {
    #[serde(flatten)]
    pub unwilling_smoke_fields: UnwillingSmoke,
    pub r#type: BigUnionTwentyType,
}

impl BigUnionTwenty {
    pub fn builder() -> BigUnionTwentyBuilder {
        <BigUnionTwentyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwentyBuilder {
    unwilling_smoke_fields: Option<UnwillingSmoke>,
    r#type: Option<BigUnionTwentyType>,
}

impl BigUnionTwentyBuilder {
    pub fn unwilling_smoke_fields(mut self, value: UnwillingSmoke) -> Self {
        self.unwilling_smoke_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwentyType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwenty`].
    /// This method will fail if any of the following fields are not set:
    /// - [`unwilling_smoke_fields`](BigUnionTwentyBuilder::unwilling_smoke_fields)
    /// - [`r#type`](BigUnionTwentyBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwenty, BuildError> {
        Ok(BigUnionTwenty {
            unwilling_smoke_fields: self.unwilling_smoke_fields.ok_or_else(|| BuildError::missing_field("unwilling_smoke_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
