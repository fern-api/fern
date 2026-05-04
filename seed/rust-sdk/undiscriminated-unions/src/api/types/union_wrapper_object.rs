pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WrapperObject {
    pub inner: NestedObjectUnion,
    #[serde(default)]
    pub label: String,
}

impl WrapperObject {
    pub fn builder() -> WrapperObjectBuilder {
        <WrapperObjectBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WrapperObjectBuilder {
    inner: Option<NestedObjectUnion>,
    label: Option<String>,
}

impl WrapperObjectBuilder {
    pub fn inner(mut self, value: NestedObjectUnion) -> Self {
        self.inner = Some(value);
        self
    }

    pub fn label(mut self, value: impl Into<String>) -> Self {
        self.label = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`WrapperObject`].
    /// This method will fail if any of the following fields are not set:
    /// - [`inner`](WrapperObjectBuilder::inner)
    /// - [`label`](WrapperObjectBuilder::label)
    pub fn build(self) -> Result<WrapperObject, BuildError> {
        Ok(WrapperObject {
            inner: self
                .inner
                .ok_or_else(|| BuildError::missing_field("inner"))?,
            label: self
                .label
                .ok_or_else(|| BuildError::missing_field("label"))?,
        })
    }
}
