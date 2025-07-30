use crate::account::Account;
use crate::patient::Patient;
use crate::practitioner::Practitioner;
use crate::script::Script;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum ResourceList {
        Account(Account),

        Patient(Patient),

        Practitioner(Practitioner),

        Script(Script),
}

impl ResourceList {
    pub fn is_account(&self) -> bool {
        matches!(self, Self::Account(_))
    }

    pub fn is_patient(&self) -> bool {
        matches!(self, Self::Patient(_))
    }

    pub fn is_practitioner(&self) -> bool {
        matches!(self, Self::Practitioner(_))
    }

    pub fn is_script(&self) -> bool {
        matches!(self, Self::Script(_))
    }


    pub fn as_account(&self) -> Option<&Account> {
        match self {
                    Self::Account(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_account(self) -> Option<Account> {
        match self {
                    Self::Account(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_patient(&self) -> Option<&Patient> {
        match self {
                    Self::Patient(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_patient(self) -> Option<Patient> {
        match self {
                    Self::Patient(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_practitioner(&self) -> Option<&Practitioner> {
        match self {
                    Self::Practitioner(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_practitioner(self) -> Option<Practitioner> {
        match self {
                    Self::Practitioner(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_script(&self) -> Option<&Script> {
        match self {
                    Self::Script(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_script(self) -> Option<Script> {
        match self {
                    Self::Script(value) => Some(value),
                    _ => None,
                }
    }

}
