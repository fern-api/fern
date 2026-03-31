pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct NestedObjectWithLiterals {
    #[serde(rename = "literal1")]
    pub literal_1: String,
    #[serde(rename = "literal2")]
    pub literal_2: String,
    #[serde(rename = "strProp")]
    #[serde(default)]
    pub str_prop: String,
}

impl NestedObjectWithLiterals {
    pub fn builder() -> NestedObjectWithLiteralsBuilder {
        <NestedObjectWithLiteralsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NestedObjectWithLiteralsBuilder {
    literal_1: Option<String>,
    literal_2: Option<String>,
    str_prop: Option<String>,
}

impl NestedObjectWithLiteralsBuilder {
    pub fn literal_1(mut self, value: impl Into<String>) -> Self {
        self.literal_1 = Some(value.into());
        self
    }

    pub fn literal_2(mut self, value: impl Into<String>) -> Self {
        self.literal_2 = Some(value.into());
        self
    }

    pub fn str_prop(mut self, value: impl Into<String>) -> Self {
        self.str_prop = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NestedObjectWithLiterals`].
    /// This method will fail if any of the following fields are not set:
    /// - [`literal_1`](NestedObjectWithLiteralsBuilder::literal_1)
    /// - [`literal_2`](NestedObjectWithLiteralsBuilder::literal_2)
    /// - [`str_prop`](NestedObjectWithLiteralsBuilder::str_prop)
    pub fn build(self) -> Result<NestedObjectWithLiterals, BuildError> {
        Ok(NestedObjectWithLiterals {
            literal_1: self
                .literal_1
                .ok_or_else(|| BuildError::missing_field("literal_1"))?,
            literal_2: self
                .literal_2
                .ok_or_else(|| BuildError::missing_field("literal_2"))?,
            str_prop: self
                .str_prop
                .ok_or_else(|| BuildError::missing_field("str_prop"))?,
        })
    }
}
