pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UserCreateUserRequestType {
    CreateUserRequest,
}
impl fmt::Display for UserCreateUserRequestType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::CreateUserRequest => "CreateUserRequest",
        };
        write!(f, "{}", s)
    }
}
