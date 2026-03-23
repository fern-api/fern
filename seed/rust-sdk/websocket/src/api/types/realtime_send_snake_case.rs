pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendSnakeCase {
    #[serde(default)]
    pub send_text: String,
    #[serde(default)]
    pub send_param: i64,
}

impl SendSnakeCase {
    pub fn builder() -> SendSnakeCaseBuilder {
        SendSnakeCaseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendSnakeCaseBuilder {
    send_text: Option<String>,
    send_param: Option<i64>,
}

impl SendSnakeCaseBuilder {
    pub fn send_text(mut self, value: impl Into<String>) -> Self {
        self.send_text = Some(value.into());
        self
    }

    pub fn send_param(mut self, value: i64) -> Self {
        self.send_param = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendSnakeCase`].
    /// This method will fail if any of the following fields are not set:
    /// - [`send_text`](SendSnakeCaseBuilder::send_text)
    /// - [`send_param`](SendSnakeCaseBuilder::send_param)
    pub fn build(self) -> Result<SendSnakeCase, BuildError> {
        Ok(SendSnakeCase {
            send_text: self.send_text.ok_or_else(|| BuildError::missing_field("send_text"))?,
            send_param: self.send_param.ok_or_else(|| BuildError::missing_field("send_param"))?,
        })
    }
}
