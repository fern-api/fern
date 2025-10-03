pub use crate::prelude::*;

/// A user object. This type is used throughout the following APIs:
/// - createUser
/// - getUser
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct User {
    pub id: String,
    /// The user's name. This name is unique to each user. A few examples are included below:
    /// - Alice
    /// - Bob
    /// - Charlie
    pub name: String,
    /// The user's age.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
}