pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Event {
    #[serde(default)]
    pub data: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub retry: Option<i64>,
}

impl Event {
    pub fn builder() -> EventBuilder {
        EventBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EventBuilder {
    data: Option<String>,
    event: Option<String>,
    id: Option<String>,
    retry: Option<i64>,
}

impl EventBuilder {
    pub fn data(mut self, value: impl Into<String>) -> Self {
        self.data = Some(value.into());
        self
    }

    pub fn event(mut self, value: impl Into<String>) -> Self {
        self.event = Some(value.into());
        self
    }

    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn retry(mut self, value: i64) -> Self {
        self.retry = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Event`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](EventBuilder::data)
    pub fn build(self) -> Result<Event, BuildError> {
        Ok(Event {
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
            event: self.event,
            id: self.id,
            retry: self.retry,
        })
    }
}
