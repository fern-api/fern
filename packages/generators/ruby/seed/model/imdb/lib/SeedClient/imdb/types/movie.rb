# frozen_string_literal: true

require_relative "imdb/types/MOVIE_ID"
require "json"

module SeedClient
  module Imdb
    class Movie
      attr_reader :id, :title, :rating, :additional_properties

      # @param id [Imdb::MOVIE_ID]
      # @param title [String]
      # @param rating [Float] The rating scale is one to five stars
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Imdb::Movie]
      def initialze(id:, title:, rating:, additional_properties: nil)
        # @type [Imdb::MOVIE_ID]
        @id = id
        # @type [String]
        @title = title
        # @type [Float] The rating scale is one to five stars
        @rating = rating
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Movie
      #
      # @param json_object [JSON]
      # @return [Imdb::Movie]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = struct.id
        title = struct.title
        rating = struct.rating
        new(id: id, title: title, rating: rating, additional_properties: struct)
      end

      # Serialize an instance of Movie to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "id": @id, "title": @title, "rating": @rating }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.title.is_a?(String) != false || raise("Passed value for field obj.title is not the expected type, validation failed.")
        obj.rating.is_a?(Float) != false || raise("Passed value for field obj.rating is not the expected type, validation failed.")
      end
    end
  end
end
