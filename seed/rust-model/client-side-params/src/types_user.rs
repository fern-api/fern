pub use crate::prelude::*;

/// User object similar to Auth0 users
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct User {
    #[serde(default)]
    pub user_id: String,
    #[serde(default)]
    pub email: String,
    #[serde(default)]
    pub email_verified: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone_verified: Option<bool>,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub created_at: DateTime<FixedOffset>,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub updated_at: DateTime<FixedOffset>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub identities: Option<Vec<Identity>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub picture: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nickname: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub multifactor: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_ip: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub last_login: Option<DateTime<FixedOffset>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logins_count: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blocked: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub given_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub family_name: Option<String>,
}

impl User {
    pub fn builder() -> UserBuilder {
        <UserBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserBuilder {
    user_id: Option<String>,
    email: Option<String>,
    email_verified: Option<bool>,
    username: Option<String>,
    phone_number: Option<String>,
    phone_verified: Option<bool>,
    created_at: Option<DateTime<FixedOffset>>,
    updated_at: Option<DateTime<FixedOffset>>,
    identities: Option<Vec<Identity>>,
    app_metadata: Option<HashMap<String, serde_json::Value>>,
    user_metadata: Option<HashMap<String, serde_json::Value>>,
    picture: Option<String>,
    name: Option<String>,
    nickname: Option<String>,
    multifactor: Option<Vec<String>>,
    last_ip: Option<String>,
    last_login: Option<DateTime<FixedOffset>>,
    logins_count: Option<i64>,
    blocked: Option<bool>,
    given_name: Option<String>,
    family_name: Option<String>,
}

impl UserBuilder {
    pub fn user_id(mut self, value: impl Into<String>) -> Self {
        self.user_id = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    pub fn email_verified(mut self, value: bool) -> Self {
        self.email_verified = Some(value);
        self
    }

    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    pub fn phone_number(mut self, value: impl Into<String>) -> Self {
        self.phone_number = Some(value.into());
        self
    }

    pub fn phone_verified(mut self, value: bool) -> Self {
        self.phone_verified = Some(value);
        self
    }

    pub fn created_at(mut self, value: DateTime<FixedOffset>) -> Self {
        self.created_at = Some(value);
        self
    }

    pub fn updated_at(mut self, value: DateTime<FixedOffset>) -> Self {
        self.updated_at = Some(value);
        self
    }

    pub fn identities(mut self, value: Vec<Identity>) -> Self {
        self.identities = Some(value);
        self
    }

    pub fn app_metadata(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.app_metadata = Some(value);
        self
    }

    pub fn user_metadata(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.user_metadata = Some(value);
        self
    }

    pub fn picture(mut self, value: impl Into<String>) -> Self {
        self.picture = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn nickname(mut self, value: impl Into<String>) -> Self {
        self.nickname = Some(value.into());
        self
    }

    pub fn multifactor(mut self, value: Vec<String>) -> Self {
        self.multifactor = Some(value);
        self
    }

    pub fn last_ip(mut self, value: impl Into<String>) -> Self {
        self.last_ip = Some(value.into());
        self
    }

    pub fn last_login(mut self, value: DateTime<FixedOffset>) -> Self {
        self.last_login = Some(value);
        self
    }

    pub fn logins_count(mut self, value: i64) -> Self {
        self.logins_count = Some(value);
        self
    }

    pub fn blocked(mut self, value: bool) -> Self {
        self.blocked = Some(value);
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

    /// Consumes the builder and constructs a [`User`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_id`](UserBuilder::user_id)
    /// - [`email`](UserBuilder::email)
    /// - [`email_verified`](UserBuilder::email_verified)
    /// - [`created_at`](UserBuilder::created_at)
    /// - [`updated_at`](UserBuilder::updated_at)
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            user_id: self.user_id.ok_or_else(|| BuildError::missing_field("user_id"))?,
            email: self.email.ok_or_else(|| BuildError::missing_field("email"))?,
            email_verified: self.email_verified.ok_or_else(|| BuildError::missing_field("email_verified"))?,
            username: self.username,
            phone_number: self.phone_number,
            phone_verified: self.phone_verified,
            created_at: self.created_at.ok_or_else(|| BuildError::missing_field("created_at"))?,
            updated_at: self.updated_at.ok_or_else(|| BuildError::missing_field("updated_at"))?,
            identities: self.identities,
            app_metadata: self.app_metadata,
            user_metadata: self.user_metadata,
            picture: self.picture,
            name: self.name,
            nickname: self.nickname,
            multifactor: self.multifactor,
            last_ip: self.last_ip,
            last_login: self.last_login,
            logins_count: self.logins_count,
            blocked: self.blocked,
            given_name: self.given_name,
            family_name: self.family_name,
        })
    }
}
