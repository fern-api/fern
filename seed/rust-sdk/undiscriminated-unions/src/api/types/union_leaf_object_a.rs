pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct LeafObjectA {
    #[serde(rename = "onlyInA")]
    #[serde(default)]
    pub only_in_a: String,
    #[serde(rename = "sharedNumber")]
    #[serde(default)]
    pub shared_number: i64,
}

impl LeafObjectA {
    pub fn builder() -> LeafObjectABuilder {
        <LeafObjectABuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LeafObjectABuilder {
    only_in_a: Option<String>,
    shared_number: Option<i64>,
}

impl LeafObjectABuilder {
    pub fn only_in_a(mut self, value: impl Into<String>) -> Self {
        self.only_in_a = Some(value.into());
        self
    }

    pub fn shared_number(mut self, value: i64) -> Self {
        self.shared_number = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`LeafObjectA`].
    /// This method will fail if any of the following fields are not set:
    /// - [`only_in_a`](LeafObjectABuilder::only_in_a)
    /// - [`shared_number`](LeafObjectABuilder::shared_number)
    pub fn build(self) -> Result<LeafObjectA, BuildError> {
        Ok(LeafObjectA {
            only_in_a: self
                .only_in_a
                .ok_or_else(|| BuildError::missing_field("only_in_a"))?,
            shared_number: self
                .shared_number
                .ok_or_else(|| BuildError::missing_field("shared_number"))?,
        })
    }
}
