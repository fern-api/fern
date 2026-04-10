pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserCreateUserRequest {
    /// The name of the user to create.
    /// This name is unique to each user.
    #[serde(default)]
    pub name: String,
    /// The age of the user.
    /// This property is not required.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
}

impl UserCreateUserRequest {
    pub fn builder() -> UserCreateUserRequestBuilder {
        <UserCreateUserRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserCreateUserRequestBuilder {
    name: Option<String>,
    age: Option<i64>,
}

impl UserCreateUserRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn age(mut self, value: i64) -> Self {
        self.age = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserCreateUserRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](UserCreateUserRequestBuilder::name)
    pub fn build(self) -> Result<UserCreateUserRequest, BuildError> {
        Ok(UserCreateUserRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            age: self.age,
        })
    }
}
