pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionTwelve {
    #[serde(flatten)]
    pub primary_block_fields: PrimaryBlock,
    pub r#type: BigUnionTwelveType,
}

impl BigUnionTwelve {
    pub fn builder() -> BigUnionTwelveBuilder {
        <BigUnionTwelveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionTwelveBuilder {
    primary_block_fields: Option<PrimaryBlock>,
    r#type: Option<BigUnionTwelveType>,
}

impl BigUnionTwelveBuilder {
    pub fn primary_block_fields(mut self, value: PrimaryBlock) -> Self {
        self.primary_block_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionTwelveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionTwelve`].
    /// This method will fail if any of the following fields are not set:
    /// - [`primary_block_fields`](BigUnionTwelveBuilder::primary_block_fields)
    /// - [`r#type`](BigUnionTwelveBuilder::r#type)
    pub fn build(self) -> Result<BigUnionTwelve, BuildError> {
        Ok(BigUnionTwelve {
            primary_block_fields: self.primary_block_fields.ok_or_else(|| BuildError::missing_field("primary_block_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
