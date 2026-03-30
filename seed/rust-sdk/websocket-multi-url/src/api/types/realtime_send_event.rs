pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SendEvent {
    #[serde(default)]
    pub text: String,
    #[serde(default)]
    pub priority: i64,
}

impl SendEvent {
    pub fn builder() -> SendEventBuilder {
        <SendEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SendEventBuilder {
    text: Option<String>,
    priority: Option<i64>,
}

impl SendEventBuilder {
    pub fn text(mut self, value: impl Into<String>) -> Self {
        self.text = Some(value.into());
        self
    }

    pub fn priority(mut self, value: i64) -> Self {
        self.priority = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SendEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`text`](SendEventBuilder::text)
    /// - [`priority`](SendEventBuilder::priority)
    pub fn build(self) -> Result<SendEvent, BuildError> {
        Ok(SendEvent {
            text: self.text.ok_or_else(|| BuildError::missing_field("text"))?,
            priority: self
                .priority
                .ok_or_else(|| BuildError::missing_field("priority"))?,
        })
    }
}
