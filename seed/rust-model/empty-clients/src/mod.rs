//! Request and response types for the empty-clients
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 6 types for data representation

pub mod level_1_level_2_person;
pub mod level_1_level_2_address_country;
pub mod level_1_level_2_address;
pub mod level_1_person;
pub mod level_1_address_country;
pub mod level_1_address;

pub use level_1_level_2_person::Level1Level2Person;
pub use level_1_level_2_address_country::Level1Level2AddressCountry;
pub use level_1_level_2_address::Level1Level2Address;
pub use level_1_person::Level1Person;
pub use level_1_address_country::Level1AddressCountry;
pub use level_1_address::Level1Address;

