pub use crate::prelude::*;

/// A standard object with no nullable issues.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NormalObject {
    #[serde(rename = "normalField")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub normal_field: Option<String>,
}

impl NormalObject {
    pub fn builder() -> NormalObjectBuilder {
        NormalObjectBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NormalObjectBuilder {
    normal_field: Option<String>,
}

impl NormalObjectBuilder {
    pub fn normal_field(mut self, value: impl Into<String>) -> Self {
        self.normal_field = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`NormalObject`].
    pub fn build(self) -> Result<NormalObject, BuildError> {
        Ok(NormalObject {
            normal_field: self.normal_field,
        })
    }
}
