# frozen_string_literal: true

require_relative "../type"
require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class ResponseType
      # @return [SeedExamplesClient::Type]
      attr_reader :type
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param type [SeedExamplesClient::Type]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::ResponseType]
      def initialize(type:, additional_properties: nil)
        @type = type
        @additional_properties = additional_properties
        @_field_set = { "type": type }
      end

      # Deserialize a JSON object to an instance of ResponseType
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::ResponseType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["type"].nil?
          type = nil
        else
          type = parsed_json["type"].to_json
          type = SeedExamplesClient::Type.from_json(json_object: type)
        end
        new(type: type, additional_properties: struct)
      end

      # Serialize an instance of ResponseType to a JSON object
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
        SeedExamplesClient::Type.validate_raw(obj: obj.type)
      end
    end
  end
end
