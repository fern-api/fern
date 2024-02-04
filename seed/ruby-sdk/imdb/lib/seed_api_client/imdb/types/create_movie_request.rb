# frozen_string_literal: true

require "json"

module SeedApiClient
  module Imdb
    class CreateMovieRequest
      attr_reader :title, :rating, :additional_properties

      # @param title [String]
      # @param rating [Float]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Imdb::CreateMovieRequest]
      def initialize(title:, rating:, additional_properties: nil)
        # @type [String]
        @title = title
        # @type [Float]
        @rating = rating
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of CreateMovieRequest
      #
      # @param json_object [JSON]
      # @return [Imdb::CreateMovieRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        title = struct.title
        rating = struct.rating
        new(title: title, rating: rating, additional_properties: struct)
      end

      # Serialize an instance of CreateMovieRequest to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "title": @title, "rating": @rating }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.title.is_a?(String) != false || raise("Passed value for field obj.title is not the expected type, validation failed.")
        obj.rating.is_a?(Float) != false || raise("Passed value for field obj.rating is not the expected type, validation failed.")
      end
    end
  end
end
