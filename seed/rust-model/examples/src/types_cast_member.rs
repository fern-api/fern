pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum TypesCastMember {
        Actor(TypesActor),

        Actress(TypesActress),

        StuntDouble(TypesStuntDouble),
}

impl TypesCastMember {
    pub fn is_actor(&self) -> bool {
        matches!(self, Self::Actor(_))
    }

    pub fn is_actress(&self) -> bool {
        matches!(self, Self::Actress(_))
    }

    pub fn is_stuntdouble(&self) -> bool {
        matches!(self, Self::StuntDouble(_))
    }


    pub fn as_actor(&self) -> Option<&TypesActor> {
        match self {
                    Self::Actor(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_actor(self) -> Option<TypesActor> {
        match self {
                    Self::Actor(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_actress(&self) -> Option<&TypesActress> {
        match self {
                    Self::Actress(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_actress(self) -> Option<TypesActress> {
        match self {
                    Self::Actress(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_stuntdouble(&self) -> Option<&TypesStuntDouble> {
        match self {
                    Self::StuntDouble(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_stuntdouble(self) -> Option<TypesStuntDouble> {
        match self {
                    Self::StuntDouble(value) => Some(value),
                    _ => None,
                }
    }

}
