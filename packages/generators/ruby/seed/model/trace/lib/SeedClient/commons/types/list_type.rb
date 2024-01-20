# frozen_string_literal: true

require_relative "commons/types/VariableType"
require "json"

module SeedClient
  module Commons
    class ListType
      attr_reader :value_type, :is_fixed_length, :additional_properties

      # @param value_type [Commons::VariableType]
      # @param is_fixed_length [Boolean] Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::ListType]
      def initialze(value_type:, is_fixed_length: nil, additional_properties: nil)
        # @type [Commons::VariableType]
        @value_type = value_type
        # @type [Boolean]
        @is_fixed_length = is_fixed_length
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ListType
      #
      # @param json_object [JSON]
      # @return [Commons::ListType]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        value_type = Commons::VariableType.from_json(json_object: struct.valueType)
        is_fixed_length = struct.isFixedLength
        new(value_type: value_type, is_fixed_length: is_fixed_length, additional_properties: struct)
      end

      # Serialize an instance of ListType to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          valueType: @value_type,
          isFixedLength: @is_fixed_length
        }.to_json
      end
    end
  end
end
