# frozen_string_literal: true

require_relative "movie_id"
require "json"

module SeedApiClient
  class Imdb
    class Movie
      attr_reader :id, :movie_title, :movie_rating, :additional_properties

      # @param id [Imdb::MOVIE_ID]
      # @param movie_title [String]
      # @param movie_rating [Float] The rating scale is one to five stars
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Imdb::Movie]
      def initialize(id:, movie_title:, movie_rating:, additional_properties: nil)
        # @type [Imdb::MOVIE_ID]
        @id = id
        # @type [String]
        @movie_title = movie_title
        # @type [Float] The rating scale is one to five stars
        @movie_rating = movie_rating
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Movie
      #
      # @param json_object [JSON]
      # @return [Imdb::Movie]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        id = struct._id
        movie_title = struct.movie_title
        movie_rating = struct.movie_rating
        new(id: id, movie_title: movie_title, movie_rating: movie_rating, additional_properties: struct)
      end

      # Serialize an instance of Movie to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "_id": @id, "movie_title": @movie_title, "movie_rating": @movie_rating }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.movie_title.is_a?(String) != false || raise("Passed value for field obj.movie_title is not the expected type, validation failed.")
        obj.movie_rating.is_a?(Float) != false || raise("Passed value for field obj.movie_rating is not the expected type, validation failed.")
      end
    end
  end
end
