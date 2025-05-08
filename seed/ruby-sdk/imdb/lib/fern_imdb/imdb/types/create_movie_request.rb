# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class Imdb
    class CreateMovieRequest
      # @return [String]
      attr_reader :title
      # @return [Float]
      attr_reader :rating
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param title [String]
      # @param rating [Float]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedApiClient::Imdb::CreateMovieRequest]
      def initialize(title:, rating:, additional_properties: nil)
        @title = title
        @rating = rating
        @additional_properties = additional_properties
        @_field_set = { "title": title, "rating": rating }
      end

      # Deserialize a JSON object to an instance of CreateMovieRequest
      #
      # @param json_object [String]
      # @return [SeedApiClient::Imdb::CreateMovieRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        title = parsed_json["title"]
        rating = parsed_json["rating"]
        new(
          title: title,
          rating: rating,
          additional_properties: struct
        )
      end

      # Serialize an instance of CreateMovieRequest to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
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
