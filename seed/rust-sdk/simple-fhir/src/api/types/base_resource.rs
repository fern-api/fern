pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BaseResource {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub related_resources: Vec<ResourceList>,
    #[serde(default)]
    pub memo: Memo,
}

impl BaseResource {
    pub fn builder() -> BaseResourceBuilder {
        <BaseResourceBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BaseResourceBuilder {
    id: Option<String>,
    related_resources: Option<Vec<ResourceList>>,
    memo: Option<Memo>,
}

impl BaseResourceBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn related_resources(mut self, value: Vec<ResourceList>) -> Self {
        self.related_resources = Some(value);
        self
    }

    pub fn memo(mut self, value: Memo) -> Self {
        self.memo = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BaseResource`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](BaseResourceBuilder::id)
    /// - [`related_resources`](BaseResourceBuilder::related_resources)
    /// - [`memo`](BaseResourceBuilder::memo)
    pub fn build(self) -> Result<BaseResource, BuildError> {
        Ok(BaseResource {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            related_resources: self
                .related_resources
                .ok_or_else(|| BuildError::missing_field("related_resources"))?,
            memo: self.memo.ok_or_else(|| BuildError::missing_field("memo"))?,
        })
    }
}
