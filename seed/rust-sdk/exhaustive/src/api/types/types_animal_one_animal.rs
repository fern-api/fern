pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TypesAnimalOneAnimal {
    #[serde(rename = "cat")]
    Cat,
}
impl fmt::Display for TypesAnimalOneAnimal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Cat => "cat",
        };
        write!(f, "{}", s)
    }
}
