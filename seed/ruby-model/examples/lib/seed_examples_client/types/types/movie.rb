# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class Movie
      attr_reader :id, :prequel, :title, :from, :rating, :type, :tag, :book, :metadata, :additional_properties,
                  :_field_set
      protected :_field_set
      OMIT = Object.new
      # @param id [String]
      # @param prequel [String]
      # @param title [String]
      # @param from [String]
      # @param rating [Float] The rating scale is one to five stars
      # @param type [String]
      # @param tag [String]
      # @param book [String]
      # @param metadata [Hash{String => Object}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::Movie]
      def initialize(id:, title:, from:, rating:, type:, tag:, metadata:, prequel: OMIT, book: OMIT,
                     additional_properties: nil)
        # @type [String]
        @id = id
        # @type [String]
        @prequel = prequel if prequel != OMIT
        # @type [String]
        @title = title
        # @type [String]
        @from = from
        # @type [Float] The rating scale is one to five stars
        @rating = rating
        # @type [String]
        @type = type
        # @type [String]
        @tag = tag
        # @type [String]
        @book = book if book != OMIT
        # @type [Hash{String => Object}]
        @metadata = metadata
        @_field_set = {
          "id": @id,
          "prequel": @prequel,
          "title": @title,
          "from": @from,
          "rating": @rating,
          "type": @type,
          "tag": @tag,
          "book": @book,
          "metadata": @metadata
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Movie
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::Movie]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = struct["id"]
        prequel = struct["prequel"]
        title = struct["title"]
        from = struct["from"]
        rating = struct["rating"]
        type = struct["type"]
        tag = struct["tag"]
        book = struct["book"]
        metadata = struct["metadata"]
        new(id: id, prequel: prequel, title: title, from: from, rating: rating, type: type, tag: tag, book: book,
            metadata: metadata, additional_properties: struct)
      end

      # Serialize an instance of Movie to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.prequel&.is_a?(String) != false || raise("Passed value for field obj.prequel is not the expected type, validation failed.")
        obj.title.is_a?(String) != false || raise("Passed value for field obj.title is not the expected type, validation failed.")
        obj.from.is_a?(String) != false || raise("Passed value for field obj.from is not the expected type, validation failed.")
        obj.rating.is_a?(Float) != false || raise("Passed value for field obj.rating is not the expected type, validation failed.")
        obj.type.is_a?(String) != false || raise("Passed value for field obj.type is not the expected type, validation failed.")
        obj.tag.is_a?(String) != false || raise("Passed value for field obj.tag is not the expected type, validation failed.")
        obj.book&.is_a?(String) != false || raise("Passed value for field obj.book is not the expected type, validation failed.")
        obj.metadata.is_a?(Hash) != false || raise("Passed value for field obj.metadata is not the expected type, validation failed.")
      end
    end
  end
end
