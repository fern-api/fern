pub use crate::prelude::*;

/// Query parameters for getusername
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetusernameQueryRequest {
    #[serde(default)]
    pub limit: i64,
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub date: NaiveDate,
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub deadline: DateTime<FixedOffset>,
    #[serde(default)]
    pub bytes: String,
    #[serde(default)]
    pub user: User,
    #[serde(rename = "userList")]
    #[serde(default)]
    pub user_list: Vec<Option<User>>,
    #[serde(rename = "optionalDeadline")]
    #[serde(skip_serializing_if = "Option::is_none")]
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
    pub exclude_user: Vec<Option<User>>,
    #[serde(default)]
    pub filter: Vec<Option<String>>,
    #[serde(rename = "longParam")]
    #[serde(default)]
    pub long_param: i64,
    #[serde(rename = "bigIntParam")]
    #[serde(default)]
    pub big_int_param: i64,
}

impl GetusernameQueryRequest {
    pub fn builder() -> GetusernameQueryRequestBuilder {
        <GetusernameQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetusernameQueryRequestBuilder {
    limit: Option<i64>,
    id: Option<String>,
    date: Option<NaiveDate>,
    deadline: Option<DateTime<FixedOffset>>,
    bytes: Option<String>,
    user: Option<User>,
    user_list: Option<Vec<Option<User>>>,
    optional_deadline: Option<DateTime<FixedOffset>>,
    key_value: Option<HashMap<String, String>>,
    optional_string: Option<String>,
    nested_user: Option<NestedUser>,
    optional_user: Option<User>,
    exclude_user: Option<Vec<Option<User>>>,
    filter: Option<Vec<Option<String>>>,
    long_param: Option<i64>,
    big_int_param: Option<i64>,
}

impl GetusernameQueryRequestBuilder {
    pub fn limit(mut self, value: i64) -> Self {
        self.limit = Some(value);
        self
    }

    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
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

    pub fn bytes(mut self, value: impl Into<String>) -> Self {
        self.bytes = Some(value.into());
        self
    }

    pub fn user(mut self, value: User) -> Self {
        self.user = Some(value);
        self
    }

    pub fn user_list(mut self, value: Vec<Option<User>>) -> Self {
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

    pub fn exclude_user(mut self, value: Vec<Option<User>>) -> Self {
        self.exclude_user = Some(value);
        self
    }

    pub fn filter(mut self, value: Vec<Option<String>>) -> Self {
        self.filter = Some(value);
        self
    }

    pub fn long_param(mut self, value: i64) -> Self {
        self.long_param = Some(value);
        self
    }

    pub fn big_int_param(mut self, value: i64) -> Self {
        self.big_int_param = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetusernameQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`limit`](GetusernameQueryRequestBuilder::limit)
    /// - [`id`](GetusernameQueryRequestBuilder::id)
    /// - [`date`](GetusernameQueryRequestBuilder::date)
    /// - [`deadline`](GetusernameQueryRequestBuilder::deadline)
    /// - [`bytes`](GetusernameQueryRequestBuilder::bytes)
    /// - [`user`](GetusernameQueryRequestBuilder::user)
    /// - [`user_list`](GetusernameQueryRequestBuilder::user_list)
    /// - [`key_value`](GetusernameQueryRequestBuilder::key_value)
    /// - [`nested_user`](GetusernameQueryRequestBuilder::nested_user)
    /// - [`exclude_user`](GetusernameQueryRequestBuilder::exclude_user)
    /// - [`filter`](GetusernameQueryRequestBuilder::filter)
    /// - [`long_param`](GetusernameQueryRequestBuilder::long_param)
    /// - [`big_int_param`](GetusernameQueryRequestBuilder::big_int_param)
    pub fn build(self) -> Result<GetusernameQueryRequest, BuildError> {
        Ok(GetusernameQueryRequest {
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
            long_param: self.long_param.ok_or_else(|| BuildError::missing_field("long_param"))?,
            big_int_param: self.big_int_param.ok_or_else(|| BuildError::missing_field("big_int_param"))?,
        })
    }
}

