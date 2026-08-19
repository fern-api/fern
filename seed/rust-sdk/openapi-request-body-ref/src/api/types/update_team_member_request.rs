pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdateTeamMemberRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub given_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub family_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email_address: Option<String>,
}

impl UpdateTeamMemberRequest {
    pub fn builder() -> UpdateTeamMemberRequestBuilder {
        <UpdateTeamMemberRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdateTeamMemberRequestBuilder {
    given_name: Option<String>,
    family_name: Option<String>,
    email_address: Option<String>,
}

impl UpdateTeamMemberRequestBuilder {
    pub fn given_name(mut self, value: impl Into<String>) -> Self {
        self.given_name = Some(value.into());
        self
    }

    pub fn family_name(mut self, value: impl Into<String>) -> Self {
        self.family_name = Some(value.into());
        self
    }

    pub fn email_address(mut self, value: impl Into<String>) -> Self {
        self.email_address = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UpdateTeamMemberRequest`].
    pub fn build(self) -> Result<UpdateTeamMemberRequest, BuildError> {
        Ok(UpdateTeamMemberRequest {
            given_name: self.given_name,
            family_name: self.family_name,
            email_address: self.email_address,
        })
    }
}
