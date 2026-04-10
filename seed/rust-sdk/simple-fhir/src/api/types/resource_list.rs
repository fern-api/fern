pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "resource_type")]
pub enum ResourceList {
        #[non_exhaustive]
        Account {
            #[serde(flatten)]
            data: Account,
        },

        #[non_exhaustive]
        Patient {
            #[serde(flatten)]
            data: Patient,
        },

        #[non_exhaustive]
        Practitioner {
            #[serde(flatten)]
            data: Practitioner,
        },

        #[non_exhaustive]
        Script {
            #[serde(flatten)]
            data: Script,
        },
}

impl ResourceList {
    pub fn account(data: Account) -> Self {
        Self::Account { data }
    }

    pub fn patient(data: Patient) -> Self {
        Self::Patient { data }
    }

    pub fn practitioner(data: Practitioner) -> Self {
        Self::Practitioner { data }
    }

    pub fn script(data: Script) -> Self {
        Self::Script { data }
    }
}
