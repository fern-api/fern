pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithoutKeyOne {
    #[serde(flatten)]
    pub bar_fields: Bar,
    pub r#type: UnionWithoutKeyOneType,
}

impl UnionWithoutKeyOne {
    pub fn builder() -> UnionWithoutKeyOneBuilder {
        <UnionWithoutKeyOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithoutKeyOneBuilder {
    bar_fields: Option<Bar>,
    r#type: Option<UnionWithoutKeyOneType>,
}

impl UnionWithoutKeyOneBuilder {
    pub fn bar_fields(mut self, value: Bar) -> Self {
        self.bar_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithoutKeyOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithoutKeyOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`bar_fields`](UnionWithoutKeyOneBuilder::bar_fields)
    /// - [`r#type`](UnionWithoutKeyOneBuilder::r#type)
    pub fn build(self) -> Result<UnionWithoutKeyOne, BuildError> {
        Ok(UnionWithoutKeyOne {
            bar_fields: self
                .bar_fields
                .ok_or_else(|| BuildError::missing_field("bar_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
