pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(transparent)]
pub struct T {
    pub child: Box<TorU>,
}

impl T {
    pub fn builder() -> TBuilder {
        TBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TBuilder {
    child: Option<Box<TorU>>,
}

impl TBuilder {
    pub fn child(mut self, value: Box<TorU>) -> Self {
        self.child = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`T`].
    /// This method will fail if any of the following fields are not set:
    /// - [`child`](TBuilder::child)
    pub fn build(self) -> Result<T, BuildError> {
        Ok(T {
            child: self.child.ok_or_else(|| BuildError::missing_field("child"))?,
        })
    }
}
