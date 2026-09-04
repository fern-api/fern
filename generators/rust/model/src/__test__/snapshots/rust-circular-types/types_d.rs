pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct D {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub a: Option<A>,
    #[serde(default)]
    pub name: String,
}

impl D {
    pub fn builder() -> DBuilder {
        <DBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DBuilder {
    a: Option<A>,
    name: Option<String>,
}

impl DBuilder {
    pub fn a(mut self, value: A) -> Self {
        self.a = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`D`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](DBuilder::name)
    pub fn build(self) -> Result<D, BuildError> {
        Ok(D {
            a: self.a,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
