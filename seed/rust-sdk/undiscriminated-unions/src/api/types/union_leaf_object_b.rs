pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct LeafObjectB {
    #[serde(rename = "onlyInB")]
    #[serde(default)]
    pub only_in_b: String,
}

impl LeafObjectB {
    pub fn builder() -> LeafObjectBBuilder {
        <LeafObjectBBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LeafObjectBBuilder {
    only_in_b: Option<String>,
}

impl LeafObjectBBuilder {
    pub fn only_in_b(mut self, value: impl Into<String>) -> Self {
        self.only_in_b = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`LeafObjectB`].
    /// This method will fail if any of the following fields are not set:
    /// - [`only_in_b`](LeafObjectBBuilder::only_in_b)
    pub fn build(self) -> Result<LeafObjectB, BuildError> {
        Ok(LeafObjectB {
            only_in_b: self
                .only_in_b
                .ok_or_else(|| BuildError::missing_field("only_in_b"))?,
        })
    }
}
