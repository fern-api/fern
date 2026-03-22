pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FlushedEvent {
    pub r#type: String,
}

impl FlushedEvent {
    pub fn builder() -> FlushedEventBuilder {
        FlushedEventBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FlushedEventBuilder {
    r#type: Option<String>,
}

impl FlushedEventBuilder {
    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FlushedEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](FlushedEventBuilder::r#type)
    pub fn build(self) -> Result<FlushedEvent, BuildError> {
        Ok(FlushedEvent {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
