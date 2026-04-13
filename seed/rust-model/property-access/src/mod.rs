//! Request and response types for the property-access
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 13 types for data representation

pub mod user;
pub mod user_profile;
pub mod user_profile_verification;
pub mod user_or_admin;
pub mod admin;
pub mod user_or_admin_discriminated_zero_type;
pub mod user_or_admin_discriminated_zero;
pub mod user_or_admin_discriminated_admin_type;
pub mod user_or_admin_discriminated_admin;
pub mod user_or_admin_discriminated_two_type;
pub mod user_or_admin_discriminated_two;
pub mod user_or_admin_discriminated;
pub mod foo;

pub use user::User;
pub use user_profile::UserProfile;
pub use user_profile_verification::UserProfileVerification;
pub use user_or_admin::UserOrAdmin;
pub use admin::Admin;
pub use user_or_admin_discriminated_zero_type::UserOrAdminDiscriminatedZeroType;
pub use user_or_admin_discriminated_zero::UserOrAdminDiscriminatedZero;
pub use user_or_admin_discriminated_admin_type::UserOrAdminDiscriminatedAdminType;
pub use user_or_admin_discriminated_admin::UserOrAdminDiscriminatedAdmin;
pub use user_or_admin_discriminated_two_type::UserOrAdminDiscriminatedTwoType;
pub use user_or_admin_discriminated_two::UserOrAdminDiscriminatedTwo;
pub use user_or_admin_discriminated::UserOrAdminDiscriminated;
pub use foo::Foo;

