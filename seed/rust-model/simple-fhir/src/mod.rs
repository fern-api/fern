//! Request and response types for the simple-fhir
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 11 types for data representation

pub mod memo;
pub mod base_resource;
pub mod resource_list;
pub mod account_resource_type;
pub mod account;
pub mod patient_resource_type;
pub mod patient;
pub mod practitioner_resource_type;
pub mod practitioner;
pub mod script_resource_type;
pub mod script;

pub use memo::Memo;
pub use base_resource::BaseResource;
pub use resource_list::ResourceList;
pub use account_resource_type::AccountResourceType;
pub use account::Account;
pub use patient_resource_type::PatientResourceType;
pub use patient::Patient;
pub use practitioner_resource_type::PractitionerResourceType;
pub use practitioner::Practitioner;
pub use script_resource_type::ScriptResourceType;
pub use script::Script;

