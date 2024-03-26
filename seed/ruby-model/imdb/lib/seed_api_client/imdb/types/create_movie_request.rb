# frozen_string_literal: true

require "json"

module SeedApiClient
  class Imdb
    class CreateMovieRequest
      attr_reader :movie_title, :movie_rating, :additional_properties

      # @param movie_title [String]
      # @param movie_rating [Float]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Imdb::CreateMovieRequest]
      def initialize(movie_title:, movie_rating:, additional_properties: nil)
        # @type [String]
        @movie_title = movie_title
        # @type [Float]
        @movie_rating = movie_rating
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of CreateMovieRequest
      #
      # @param json_object [JSON]
      # @return [Imdb::CreateMovieRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        movie_title = struct.movie_title
        movie_rating = struct.movie_rating
        new(movie_title: movie_title, movie_rating: movie_rating, additional_properties: struct)
      end

      # Serialize an instance of CreateMovieRequest to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "movie_title": @movie_title, "movie_rating": @movie_rating }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.movie_title.is_a?(String) != false || raise("Passed value for field obj.movie_title is not the expected type, validation failed.")
        obj.movie_rating.is_a?(Float) != false || raise("Passed value for field obj.movie_rating is not the expected type, validation failed.")
      end
    end
  end
end
