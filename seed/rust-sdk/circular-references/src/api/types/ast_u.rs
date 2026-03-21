pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(transparent)]
pub struct U {
    pub child: Box<T>,
}

impl U {
    pub fn builder() -> UBuilder {
        UBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UBuilder {
    child: Option<Box<T>>,
}

impl UBuilder {
    pub fn child(mut self, value: Box<T>) -> Self {
        self.child = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`U`].
    /// This method will fail if any of the following fields are not set:
    /// - [`child`](UBuilder::child)
    pub fn build(self) -> Result<U, BuildError> {
        Ok(U {
            child: self.child.ok_or_else(|| BuildError::missing_field("child"))?,
        })
    }
}
