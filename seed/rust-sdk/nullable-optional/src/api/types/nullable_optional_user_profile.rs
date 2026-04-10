pub use crate::prelude::*;

/// Test object with nullable and optional fields
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UserProfile {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub username: String,
    #[serde(rename = "nullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_string: Option<String>,
    #[serde(rename = "nullableInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_integer: Option<i64>,
    #[serde(rename = "nullableBoolean")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_boolean: Option<bool>,
    #[serde(rename = "nullableDate")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub nullable_date: Option<DateTime<FixedOffset>>,
    #[serde(rename = "nullableObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_object: Option<Address>,
    #[serde(rename = "nullableList")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_list: Option<Vec<String>>,
    #[serde(rename = "nullableMap")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_map: Option<HashMap<String, String>>,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "optionalInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_integer: Option<i64>,
    #[serde(rename = "optionalBoolean")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_boolean: Option<bool>,
    #[serde(rename = "optionalDate")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub optional_date: Option<DateTime<FixedOffset>>,
    #[serde(rename = "optionalObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_object: Option<Address>,
    #[serde(rename = "optionalList")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_list: Option<Vec<String>>,
    #[serde(rename = "optionalMap")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_map: Option<HashMap<String, String>>,
    #[serde(rename = "optionalNullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_string: Option<String>,
    #[serde(rename = "optionalNullableObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_object: Option<Address>,
}

impl UserProfile {
    pub fn builder() -> UserProfileBuilder {
        <UserProfileBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserProfileBuilder {
    id: Option<String>,
    username: Option<String>,
    nullable_string: Option<String>,
    nullable_integer: Option<i64>,
    nullable_boolean: Option<bool>,
    nullable_date: Option<DateTime<FixedOffset>>,
    nullable_object: Option<Address>,
    nullable_list: Option<Vec<String>>,
    nullable_map: Option<HashMap<String, String>>,
    optional_string: Option<String>,
    optional_integer: Option<i64>,
    optional_boolean: Option<bool>,
    optional_date: Option<DateTime<FixedOffset>>,
    optional_object: Option<Address>,
    optional_list: Option<Vec<String>>,
    optional_map: Option<HashMap<String, String>>,
    optional_nullable_string: Option<String>,
    optional_nullable_object: Option<Address>,
}

impl UserProfileBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn username(mut self, value: impl Into<String>) -> Self {
        self.username = Some(value.into());
        self
    }

    pub fn nullable_string(mut self, value: impl Into<String>) -> Self {
        self.nullable_string = Some(value.into());
        self
    }

    pub fn nullable_integer(mut self, value: i64) -> Self {
        self.nullable_integer = Some(value);
        self
    }

    pub fn nullable_boolean(mut self, value: bool) -> Self {
        self.nullable_boolean = Some(value);
        self
    }

    pub fn nullable_date(mut self, value: DateTime<FixedOffset>) -> Self {
        self.nullable_date = Some(value);
        self
    }

    pub fn nullable_object(mut self, value: Address) -> Self {
        self.nullable_object = Some(value);
        self
    }

    pub fn nullable_list(mut self, value: Vec<String>) -> Self {
        self.nullable_list = Some(value);
        self
    }

    pub fn nullable_map(mut self, value: HashMap<String, String>) -> Self {
        self.nullable_map = Some(value);
        self
    }

    pub fn optional_string(mut self, value: impl Into<String>) -> Self {
        self.optional_string = Some(value.into());
        self
    }

    pub fn optional_integer(mut self, value: i64) -> Self {
        self.optional_integer = Some(value);
        self
    }

    pub fn optional_boolean(mut self, value: bool) -> Self {
        self.optional_boolean = Some(value);
        self
    }

    pub fn optional_date(mut self, value: DateTime<FixedOffset>) -> Self {
        self.optional_date = Some(value);
        self
    }

    pub fn optional_object(mut self, value: Address) -> Self {
        self.optional_object = Some(value);
        self
    }

    pub fn optional_list(mut self, value: Vec<String>) -> Self {
        self.optional_list = Some(value);
        self
    }

    pub fn optional_map(mut self, value: HashMap<String, String>) -> Self {
        self.optional_map = Some(value);
        self
    }

    pub fn optional_nullable_string(mut self, value: impl Into<String>) -> Self {
        self.optional_nullable_string = Some(value.into());
        self
    }

    pub fn optional_nullable_object(mut self, value: Address) -> Self {
        self.optional_nullable_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserProfile`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserProfileBuilder::id)
    /// - [`username`](UserProfileBuilder::username)
    pub fn build(self) -> Result<UserProfile, BuildError> {
        Ok(UserProfile {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            username: self
                .username
                .ok_or_else(|| BuildError::missing_field("username"))?,
            nullable_string: self.nullable_string,
            nullable_integer: self.nullable_integer,
            nullable_boolean: self.nullable_boolean,
            nullable_date: self.nullable_date,
            nullable_object: self.nullable_object,
            nullable_list: self.nullable_list,
            nullable_map: self.nullable_map,
            optional_string: self.optional_string,
            optional_integer: self.optional_integer,
            optional_boolean: self.optional_boolean,
            optional_date: self.optional_date,
            optional_object: self.optional_object,
            optional_list: self.optional_list,
            optional_map: self.optional_map,
            optional_nullable_string: self.optional_nullable_string,
            optional_nullable_object: self.optional_nullable_object,
        })
    }
}
