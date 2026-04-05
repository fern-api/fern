pub use crate::prelude::*;

/// Query parameters for getUsername
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetUsernameQueryRequest {
    #[serde(default)]
    pub limit: i64,
    #[serde(default)]
    pub id: Uuid,
    #[serde(default)]
    pub date: NaiveDate,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub deadline: DateTime<FixedOffset>,
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes")]
    pub bytes: Vec<u8>,
    #[serde(default)]
    pub user: User,
    #[serde(rename = "userList")]
    #[serde(default)]
    pub user_list: Vec<User>,
    #[serde(rename = "optionalDeadline")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub optional_deadline: Option<DateTime<FixedOffset>>,
    #[serde(rename = "keyValue")]
    #[serde(default)]
    pub key_value: HashMap<String, String>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "nestedUser")]
    #[serde(default)]
    pub nested_user: NestedUser,
    #[serde(rename = "optionalUser")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_user: Option<User>,
    #[serde(rename = "excludeUser")]
    #[serde(default)]
    pub exclude_user: Vec<User>,
    #[serde(default)]
    pub filter: Vec<String>,
}

impl GetUsernameQueryRequest {
    pub fn builder() -> GetUsernameQueryRequestBuilder {
        <GetUsernameQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetUsernameQueryRequestBuilder {
    limit: Option<i64>,
    id: Option<Uuid>,
    date: Option<NaiveDate>,
    deadline: Option<DateTime<FixedOffset>>,
    bytes: Option<Vec<u8>>,
    user: Option<User>,
    user_list: Option<Vec<User>>,
    optional_deadline: Option<DateTime<FixedOffset>>,
    key_value: Option<HashMap<String, String>>,
    optional_string: Option<String>,
    nested_user: Option<NestedUser>,
    optional_user: Option<User>,
    exclude_user: Option<Vec<User>>,
    filter: Option<Vec<String>>,
}

impl GetUsernameQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn id(mut self, value: Uuid) -> Self {
        self.id = Some(value);
        self
    }

    pub fn date(mut self, value: NaiveDate) -> Self {
        self.date = Some(value);
        self
    }

    pub fn deadline(mut self, value: DateTime<FixedOffset>) -> Self {
        self.deadline = Some(value);
        self
    }

    pub fn bytes(mut self, value: Vec<u8>) -> Self {
        self.bytes = Some(value);
        self
    }

    pub fn user(mut self, value: User) -> Self {
        self.user = Some(value);
        self
    }

    pub fn user_list(mut self, value: Vec<User>) -> Self {
        self.user_list = Some(value);
        self
    }

    pub fn optional_deadline(mut self, value: DateTime<FixedOffset>) -> Self {
        self.optional_deadline = Some(value);
        self
    }

    pub fn key_value(mut self, value: HashMap<String, String>) -> Self {
        self.key_value = Some(value);
        self
    }

    pub fn optional_string(mut self, value: impl Into<String>) -> Self {
        self.optional_string = Some(value.into());
        self
    }

    pub fn nested_user(mut self, value: NestedUser) -> Self {
        self.nested_user = Some(value);
        self
    }

    pub fn optional_user(mut self, value: User) -> Self {
        self.optional_user = Some(value);
        self
    }

    pub fn exclude_user(mut self, value: Vec<User>) -> Self {
        self.exclude_user = Some(value);
        self
    }

    pub fn filter(mut self, value: Vec<String>) -> Self {
        self.filter = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetUsernameQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`limit`](GetUsernameQueryRequestBuilder::limit)
    /// - [`id`](GetUsernameQueryRequestBuilder::id)
    /// - [`date`](GetUsernameQueryRequestBuilder::date)
    /// - [`deadline`](GetUsernameQueryRequestBuilder::deadline)
    /// - [`bytes`](GetUsernameQueryRequestBuilder::bytes)
    /// - [`user`](GetUsernameQueryRequestBuilder::user)
    /// - [`user_list`](GetUsernameQueryRequestBuilder::user_list)
    /// - [`key_value`](GetUsernameQueryRequestBuilder::key_value)
    /// - [`nested_user`](GetUsernameQueryRequestBuilder::nested_user)
    /// - [`exclude_user`](GetUsernameQueryRequestBuilder::exclude_user)
    /// - [`filter`](GetUsernameQueryRequestBuilder::filter)
    pub fn build(self) -> Result<GetUsernameQueryRequest, BuildError> {
        Ok(GetUsernameQueryRequest {
            limit: self.limit.ok_or_else(|| BuildError::missing_field("limit"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            date: self.date.ok_or_else(|| BuildError::missing_field("date"))?,
            deadline: self.deadline.ok_or_else(|| BuildError::missing_field("deadline"))?,
            bytes: self.bytes.ok_or_else(|| BuildError::missing_field("bytes"))?,
            user: self.user.ok_or_else(|| BuildError::missing_field("user"))?,
            user_list: self.user_list.ok_or_else(|| BuildError::missing_field("user_list"))?,
            optional_deadline: self.optional_deadline,
            key_value: self.key_value.ok_or_else(|| BuildError::missing_field("key_value"))?,
            optional_string: self.optional_string,
            nested_user: self.nested_user.ok_or_else(|| BuildError::missing_field("nested_user"))?,
            optional_user: self.optional_user,
            exclude_user: self.exclude_user.ok_or_else(|| BuildError::missing_field("exclude_user"))?,
            filter: self.filter.ok_or_else(|| BuildError::missing_field("filter"))?,
        })
    }
}

