pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UserOrAdminDiscriminated {
        UserOrAdminDiscriminatedZero(UserOrAdminDiscriminatedZero),

        UserOrAdminDiscriminatedAdmin(UserOrAdminDiscriminatedAdmin),

        UserOrAdminDiscriminatedTwo(UserOrAdminDiscriminatedTwo),
}

impl UserOrAdminDiscriminated {
    pub fn is_user_or_admin_discriminated_zero(&self) -> bool {
        matches!(self, Self::UserOrAdminDiscriminatedZero(_))
    }

    pub fn is_user_or_admin_discriminated_admin(&self) -> bool {
        matches!(self, Self::UserOrAdminDiscriminatedAdmin(_))
    }

    pub fn is_user_or_admin_discriminated_two(&self) -> bool {
        matches!(self, Self::UserOrAdminDiscriminatedTwo(_))
    }


    pub fn as_user_or_admin_discriminated_zero(&self) -> Option<&UserOrAdminDiscriminatedZero> {
        match self {
                    Self::UserOrAdminDiscriminatedZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_user_or_admin_discriminated_zero(self) -> Option<UserOrAdminDiscriminatedZero> {
        match self {
                    Self::UserOrAdminDiscriminatedZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_user_or_admin_discriminated_admin(&self) -> Option<&UserOrAdminDiscriminatedAdmin> {
        match self {
                    Self::UserOrAdminDiscriminatedAdmin(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_user_or_admin_discriminated_admin(self) -> Option<UserOrAdminDiscriminatedAdmin> {
        match self {
                    Self::UserOrAdminDiscriminatedAdmin(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_user_or_admin_discriminated_two(&self) -> Option<&UserOrAdminDiscriminatedTwo> {
        match self {
                    Self::UserOrAdminDiscriminatedTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_user_or_admin_discriminated_two(self) -> Option<UserOrAdminDiscriminatedTwo> {
        match self {
                    Self::UserOrAdminDiscriminatedTwo(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for UserOrAdminDiscriminated {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UserOrAdminDiscriminatedZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::UserOrAdminDiscriminatedAdmin(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::UserOrAdminDiscriminatedTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
