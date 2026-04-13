pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct NestedObjectWithLiterals {
    pub literal1: String,
    pub literal2: String,
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
    literal1: Option<String>,
    literal2: Option<String>,
    str_prop: Option<String>,
}

impl NestedObjectWithLiteralsBuilder {
    pub fn literal1(mut self, value: impl Into<String>) -> Self {
        self.literal1 = Some(value.into());
        self
    }

    pub fn literal2(mut self, value: impl Into<String>) -> Self {
        self.literal2 = Some(value.into());
        self
    }

    pub fn str_prop(mut self, value: impl Into<String>) -> Self {
        self.str_prop = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NestedObjectWithLiterals`].
    /// This method will fail if any of the following fields are not set:
    /// - [`literal1`](NestedObjectWithLiteralsBuilder::literal1)
    /// - [`literal2`](NestedObjectWithLiteralsBuilder::literal2)
    /// - [`str_prop`](NestedObjectWithLiteralsBuilder::str_prop)
    pub fn build(self) -> Result<NestedObjectWithLiterals, BuildError> {
        Ok(NestedObjectWithLiterals {
            literal1: self
                .literal1
                .ok_or_else(|| BuildError::missing_field("literal1"))?,
            literal2: self
                .literal2
                .ok_or_else(|| BuildError::missing_field("literal2"))?,
            str_prop: self
                .str_prop
                .ok_or_else(|| BuildError::missing_field("str_prop"))?,
        })
    }
}
