# frozen_string_literal: true

require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    class Document
      # @return [String]
      attr_reader :id
      # @return [String]
      attr_reader :title
      # @return [String]
      attr_reader :content
      # @return [String]
      attr_reader :author
      # @return [Array<String>]
      attr_reader :tags
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String]
      # @param title [String]
      # @param content [String]
      # @param author [String]
      # @param tags [Array<String>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::Document]
      def initialize(id:, title:, content:, author: OMIT, tags: OMIT, additional_properties: nil)
        @id = id
        @title = title
        @content = content
        @author = author if author != OMIT
        @tags = tags if tags != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "id": id,
          "title": title,
          "content": content,
          "author": author,
          "tags": tags
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Document
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::Document]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        title = parsed_json["title"]
        content = parsed_json["content"]
        author = parsed_json["author"]
        tags = parsed_json["tags"]
        new(
          id: id,
          title: title,
          content: content,
          author: author,
          tags: tags,
          additional_properties: struct
        )
      end

      # Serialize an instance of Document to a JSON object
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
        obj.content.is_a?(String) != false || raise("Passed value for field obj.content is not the expected type, validation failed.")
        obj.author&.is_a?(String) != false || raise("Passed value for field obj.author is not the expected type, validation failed.")
        obj.tags&.is_a?(Array) != false || raise("Passed value for field obj.tags is not the expected type, validation failed.")
      end
    end
  end
end
