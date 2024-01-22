# frozen_string_literal: true
require "commons/types/VariableType"
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
        # @type [Boolean] Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
        @is_fixed_length = is_fixed_length
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of ListType
      #
      # @param json_object [JSON] 
      # @return [Commons::ListType] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        value_type Commons::VariableType.from_json(json_object: struct.valueType)
        is_fixed_length struct.isFixedLength
        new(value_type: value_type, is_fixed_length: is_fixed_length, additional_properties: struct)
      end
      # Serialize an instance of ListType to a JSON object
      #
      # @return [JSON] 
      def to_json
        { valueType: @value_type, isFixedLength: @is_fixed_length }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        VariableType.validate_raw(obj: obj.value_type)
        obj.is_fixed_length&.is_a?(Boolean) != false || raise("Passed value for field obj.is_fixed_length is not the expected type, validation failed.")
      end
    end
  end
end