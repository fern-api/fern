pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateUserRequest {
    /// The name of the user to create.
    /// This name is unique to each user.
    #[serde(default)]
    pub name: String,
    /// The age of the user.
    /// This property is not required.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
}

impl CreateUserRequest {
    pub fn builder() -> CreateUserRequestBuilder {
        <CreateUserRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateUserRequestBuilder {
    name: Option<String>,
    age: Option<i64>,
}

impl CreateUserRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn age(mut self, value: i64) -> Self {
        self.age = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateUserRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](CreateUserRequestBuilder::name)
    pub fn build(self) -> Result<CreateUserRequest, BuildError> {
        Ok(CreateUserRequest {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            age: self.age,
        })
    }
}

