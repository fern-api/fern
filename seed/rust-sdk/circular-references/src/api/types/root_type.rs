pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RootType {
    #[serde(default)]
    pub s: String,
}

impl RootType {
    pub fn builder() -> RootTypeBuilder {
        <RootTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RootTypeBuilder {
    s: Option<String>,
}

impl RootTypeBuilder {
    pub fn s(mut self, value: impl Into<String>) -> Self {
        self.s = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`RootType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`s`](RootTypeBuilder::s)
    pub fn build(self) -> Result<RootType, BuildError> {
        Ok(RootType {
            s: self.s.ok_or_else(|| BuildError::missing_field("s"))?,
        })
    }
}
