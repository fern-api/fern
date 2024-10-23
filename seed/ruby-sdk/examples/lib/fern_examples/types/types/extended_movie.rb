# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class ExtendedMovie
      # @return [Array<String>]
      attr_reader :cast
      # @return [String]
      attr_reader :id
      # @return [String]
      attr_reader :prequel
      # @return [String]
      attr_reader :title
      # @return [String]
      attr_reader :from
      # @return [Float] The rating scale is one to five stars
      attr_reader :rating
      # @return [String]
      attr_reader :type
      # @return [String]
      attr_reader :tag
      # @return [String]
      attr_reader :book
      # @return [Hash{String => Object}]
      attr_reader :metadata
      # @return [Long]
      attr_reader :revenue
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param cast [Array<String>]
      # @param id [String]
      # @param prequel [String]
      # @param title [String]
      # @param from [String]
      # @param rating [Float] The rating scale is one to five stars
      # @param type [String]
      # @param tag [String]
      # @param book [String]
      # @param metadata [Hash{String => Object}]
      # @param revenue [Long]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::ExtendedMovie]
      def initialize(cast:, id:, title:, from:, rating:, type:, tag:, metadata:, revenue:, prequel: OMIT, book: OMIT,
                     additional_properties: nil)
        @cast = cast
        @id = id
        @prequel = prequel if prequel != OMIT
        @title = title
        @from = from
        @rating = rating
        @type = type
        @tag = tag
        @book = book if book != OMIT
        @metadata = metadata
        @revenue = revenue
        @additional_properties = additional_properties
        @_field_set = {
          "cast": cast,
          "id": id,
          "prequel": prequel,
          "title": title,
          "from": from,
          "rating": rating,
          "type": type,
          "tag": tag,
          "book": book,
          "metadata": metadata,
          "revenue": revenue
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of ExtendedMovie
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::ExtendedMovie]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        cast = parsed_json["cast"]
        id = parsed_json["id"]
        prequel = parsed_json["prequel"]
        title = parsed_json["title"]
        from = parsed_json["from"]
        rating = parsed_json["rating"]
        type = parsed_json["type"]
        tag = parsed_json["tag"]
        book = parsed_json["book"]
        metadata = parsed_json["metadata"]
        revenue = parsed_json["revenue"]
        new(
          cast: cast,
          id: id,
          prequel: prequel,
          title: title,
          from: from,
          rating: rating,
          type: type,
          tag: tag,
          book: book,
          metadata: metadata,
          revenue: revenue,
          additional_properties: struct
        )
      end

      # Serialize an instance of ExtendedMovie to a JSON object
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
        obj.cast.is_a?(Array) != false || raise("Passed value for field obj.cast is not the expected type, validation failed.")
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.prequel&.is_a?(String) != false || raise("Passed value for field obj.prequel is not the expected type, validation failed.")
        obj.title.is_a?(String) != false || raise("Passed value for field obj.title is not the expected type, validation failed.")
        obj.from.is_a?(String) != false || raise("Passed value for field obj.from is not the expected type, validation failed.")
        obj.rating.is_a?(Float) != false || raise("Passed value for field obj.rating is not the expected type, validation failed.")
        obj.type.is_a?(String) != false || raise("Passed value for field obj.type is not the expected type, validation failed.")
        obj.tag.is_a?(String) != false || raise("Passed value for field obj.tag is not the expected type, validation failed.")
        obj.book&.is_a?(String) != false || raise("Passed value for field obj.book is not the expected type, validation failed.")
        obj.metadata.is_a?(Hash) != false || raise("Passed value for field obj.metadata is not the expected type, validation failed.")
        obj.revenue.is_a?(Long) != false || raise("Passed value for field obj.revenue is not the expected type, validation failed.")
      end
    end
  end
end
