pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UsernamePage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub after: Option<String>,
    #[serde(default)]
    pub data: Vec<String>,
}

impl UsernamePage {
    pub fn builder() -> UsernamePageBuilder {
        <UsernamePageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsernamePageBuilder {
    after: Option<String>,
    data: Option<Vec<String>>,
}

impl UsernamePageBuilder {
    pub fn after(mut self, value: impl Into<String>) -> Self {
        self.after = Some(value.into());
        self
    }

    pub fn data(mut self, value: Vec<String>) -> Self {
        self.data = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsernamePage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`data`](UsernamePageBuilder::data)
    pub fn build(self) -> Result<UsernamePage, BuildError> {
        Ok(UsernamePage {
            after: self.after,
            data: self.data.ok_or_else(|| BuildError::missing_field("data"))?,
        })
    }
}
