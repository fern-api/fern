pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TeamMember {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub given_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub family_name: Option<String>,
}

impl TeamMember {
    pub fn builder() -> TeamMemberBuilder {
        <TeamMemberBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TeamMemberBuilder {
    id: Option<String>,
    given_name: Option<String>,
    family_name: Option<String>,
}

impl TeamMemberBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn given_name(mut self, value: impl Into<String>) -> Self {
        self.given_name = Some(value.into());
        self
    }

    pub fn family_name(mut self, value: impl Into<String>) -> Self {
        self.family_name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TeamMember`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](TeamMemberBuilder::id)
    pub fn build(self) -> Result<TeamMember, BuildError> {
        Ok(TeamMember {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            given_name: self.given_name,
            family_name: self.family_name,
        })
    }
}
