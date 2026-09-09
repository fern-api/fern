//! Request and response types for the Knowledge API
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 5 types for data representation

pub mod knowledge_knowledge;
pub mod knowledge_knowledge_base;
pub mod knowledge_operation;
pub mod messages_message;
pub mod messages_media;

pub use knowledge_knowledge::Knowledge;
pub use knowledge_knowledge_base::KnowledgeBase;
pub use knowledge_operation::Operation;
pub use messages_message::Message;
pub use messages_media::Media;

