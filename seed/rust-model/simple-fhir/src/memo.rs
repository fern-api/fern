pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Memo {
    #[serde(default)]
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub account: Option<Account>,
}

impl Memo {
    pub fn builder() -> MemoBuilder {
        MemoBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MemoBuilder {
    description: Option<String>,
    account: Option<Account>,
}

impl MemoBuilder {
    pub fn description(mut self, value: impl Into<String>) -> Self {
        self.description = Some(value.into());
        self
    }

    pub fn account(mut self, value: Account) -> Self {
        self.account = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Memo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`description`](MemoBuilder::description)
    pub fn build(self) -> Result<Memo, BuildError> {
        Ok(Memo {
            description: self.description.ok_or_else(|| BuildError::missing_field("description"))?,
            account: self.account,
        })
    }
}
