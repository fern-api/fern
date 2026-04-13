pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTen {
    #[serde(flatten)]
    pub popular_limit_fields: PopularLimit,
    pub r#type: BigUnionTenType,
}

impl BigUnionTen {
    pub fn builder() -> BigUnionTenBuilder {
        <BigUnionTenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTenBuilder {
    popular_limit_fields: Option<PopularLimit>,
    r#type: Option<BigUnionTenType>,
}

impl BigUnionTenBuilder {
    pub fn popular_limit_fields(mut self, value: PopularLimit) -> Self {
        self.popular_limit_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTen`].
    /// This method will fail if any of the following fields are not set:
    /// - [`popular_limit_fields`](BigUnionTenBuilder::popular_limit_fields)
    /// - [`r#type`](BigUnionTenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTen, BuildError> {
        Ok(BigUnionTen {
            popular_limit_fields: self.popular_limit_fields.ok_or_else(|| BuildError::missing_field("popular_limit_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
