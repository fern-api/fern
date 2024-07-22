# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class Imdb
    class Movie
      # @return [String]
      attr_reader :id
      # @return [String]
      attr_reader :title
      # @return [Float] The rating scale is one to five stars
      attr_reader :rating
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String]
      # @param title [String]
      # @param rating [Float] The rating scale is one to five stars
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedApiClient::Imdb::Movie]
      def initialize(id:, title:, rating:, additional_properties: nil)
        @id = id
        @title = title
        @rating = rating
        @additional_properties = additional_properties
        @_field_set = { "id": id, "title": title, "rating": rating }
      end

      # Deserialize a JSON object to an instance of Movie
      #
      # @param json_object [String]
      # @return [SeedApiClient::Imdb::Movie]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        title = parsed_json["title"]
        rating = parsed_json["rating"]
        new(
          id: id,
          title: title,
          rating: rating,
          additional_properties: struct
        )
      end

      # Serialize an instance of Movie to a JSON object
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
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.title.is_a?(String) != false || raise("Passed value for field obj.title is not the expected type, validation failed.")
        obj.rating.is_a?(Float) != false || raise("Passed value for field obj.rating is not the expected type, validation failed.")
      end
    end
  end
end
