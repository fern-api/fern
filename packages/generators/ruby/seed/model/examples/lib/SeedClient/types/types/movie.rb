# frozen_string_literal: true

require_relative "types/types/MOVIE_ID"
require_relative "commons/types/types/TAG"
require "json"

module SeedClient
  module Types
    class Movie
      attr_reader :id, :title, :from, :rating, :type, :tag, :book, :additional_properties

      # @param id [Types::MOVIE_ID]
      # @param title [String]
      # @param from [String]
      # @param rating [Float] The rating scale is one to five stars
      # @param type [String]
      # @param tag [Commons::Types::TAG]
      # @param book [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Movie]
      def initialze(id:, title:, from:, rating:, type:, tag:, book: nil, additional_properties: nil)
        # @type [Types::MOVIE_ID]
        @id = id
        # @type [String]
        @title = title
        # @type [String]
        @from = from
        # @type [Float] The rating scale is one to five stars
        @rating = rating
        # @type [String]
        @type = type
        # @type [Commons::Types::TAG]
        @tag = tag
        # @type [String]
        @book = book
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Movie
      #
      # @param json_object [JSON]
      # @return [Types::Movie]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = struct.id
        title = struct.title
        from = struct.from
        rating = struct.rating
        type = struct.type
        tag = struct.tag
        book = struct.book
        new(id: id, title: title, from: from, rating: rating, type: type, tag: tag, book: book,
            additional_properties: struct)
      end

      # Serialize an instance of Movie to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "id": @id, "title": @title, "from": @from, "rating": @rating, "type": @type, "tag": @tag,
          "book": @book }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.title.is_a?(String) != false || raise("Passed value for field obj.title is not the expected type, validation failed.")
        obj.from.is_a?(String) != false || raise("Passed value for field obj.from is not the expected type, validation failed.")
        obj.rating.is_a?(Float) != false || raise("Passed value for field obj.rating is not the expected type, validation failed.")
        obj.type.is_a?(String) != false || raise("Passed value for field obj.type is not the expected type, validation failed.")
        obj.tag.is_a?(String) != false || raise("Passed value for field obj.tag is not the expected type, validation failed.")
        obj.book&.is_a?(String) != false || raise("Passed value for field obj.book is not the expected type, validation failed.")
      end
    end
  end
end
