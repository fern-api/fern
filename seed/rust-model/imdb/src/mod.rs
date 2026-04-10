//! Request and response types for the Api
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod imdb_movie_id;
pub mod imdb_movie;
pub mod imdb_create_movie_request;

pub use imdb_movie_id::MovieId;
pub use imdb_movie::Movie;
pub use imdb_create_movie_request::CreateMovieRequest;

