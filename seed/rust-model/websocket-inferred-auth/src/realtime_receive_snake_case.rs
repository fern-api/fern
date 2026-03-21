pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ReceiveSnakeCase {
    #[serde(default)]
    pub receive_text: String,
    #[serde(default)]
    pub receive_int: i64,
}

impl ReceiveSnakeCase {
    pub fn builder() -> ReceiveSnakeCaseBuilder {
        ReceiveSnakeCaseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ReceiveSnakeCaseBuilder {
    receive_text: Option<String>,
    receive_int: Option<i64>,
}

impl ReceiveSnakeCaseBuilder {
    pub fn receive_text(mut self, value: impl Into<String>) -> Self {
        self.receive_text = Some(value.into());
        self
    }

    pub fn receive_int(mut self, value: i64) -> Self {
        self.receive_int = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ReceiveSnakeCase`].
    /// This method will fail if any of the following fields are not set:
    /// - [`receive_text`](ReceiveSnakeCaseBuilder::receive_text)
    /// - [`receive_int`](ReceiveSnakeCaseBuilder::receive_int)
    pub fn build(self) -> Result<ReceiveSnakeCase, BuildError> {
        Ok(ReceiveSnakeCase {
            receive_text: self.receive_text.ok_or_else(|| BuildError::missing_field("receive_text"))?,
            receive_int: self.receive_int.ok_or_else(|| BuildError::missing_field("receive_int"))?,
        })
    }
}
