# frozen_string_literal: true

require "ostruct"
require "json"

module SeedUnionsClient
  class Types
    class SecondItemType
      # @return [String]
      attr_reader :type
      # @return [String]
      attr_reader :title
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param type [String]
      # @param title [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedUnionsClient::Types::SecondItemType]
      def initialize(title:, type: OMIT, additional_properties: nil)
        @type = type if type != OMIT
        @title = title
        @additional_properties = additional_properties
        @_field_set = { "type": type, "title": title }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SecondItemType
      #
      # @param json_object [String]
      # @return [SeedUnionsClient::Types::SecondItemType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        type = parsed_json["type"]
        title = parsed_json["title"]
        new(
          type: type,
          title: title,
          additional_properties: struct
        )
      end

      # Serialize an instance of SecondItemType to a JSON object
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
        obj.type&.is_a?(String) != false || raise("Passed value for field obj.type is not the expected type, validation failed.")
        obj.title.is_a?(String) != false || raise("Passed value for field obj.title is not the expected type, validation failed.")
      end
    end
  end
end
