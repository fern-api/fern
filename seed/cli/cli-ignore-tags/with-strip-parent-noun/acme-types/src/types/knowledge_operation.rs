pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Operation {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub status: String,
}

impl Operation {
    pub fn builder() -> OperationBuilder {
        <OperationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct OperationBuilder {
    id: Option<String>,
    status: Option<String>,
}

impl OperationBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Operation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](OperationBuilder::id)
    /// - [`status`](OperationBuilder::status)
    pub fn build(self) -> Result<Operation, BuildError> {
        Ok(Operation {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
