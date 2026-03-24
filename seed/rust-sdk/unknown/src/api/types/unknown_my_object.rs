pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct MyObject {
    pub unknown: serde_json::Value,
}

impl MyObject {
    pub fn builder() -> MyObjectBuilder {
        MyObjectBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MyObjectBuilder {
    unknown: Option<serde_json::Value>,
}

impl MyObjectBuilder {
    pub fn unknown(mut self, value: serde_json::Value) -> Self {
        self.unknown = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`MyObject`].
    /// This method will fail if any of the following fields are not set:
    /// - [`unknown`](MyObjectBuilder::unknown)
    pub fn build(self) -> Result<MyObject, BuildError> {
        Ok(MyObject {
            unknown: self
                .unknown
                .ok_or_else(|| BuildError::missing_field("unknown"))?,
        })
    }
}
