# frozen_string_literal: true

module SeedClient
  module Commons
    class GenericValue
      attr_reader :stringified_type, :stringified_value, :additional_properties

      # @param stringified_type [String]
      # @param stringified_value [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::GenericValue]
      def initialze(stringified_value:, stringified_type: nil, additional_properties: nil)
        # @type [String]
        @stringified_type = stringified_type
        # @type [String]
        @stringified_value = stringified_value
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of GenericValue
      #
      # @param json_object [JSON]
      # @return [Commons::GenericValue]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        stringified_type = struct.stringifiedType
        stringified_value = struct.stringifiedValue
        new(stringified_type: stringified_type, stringified_value: stringified_value, additional_properties: struct)
      end

      # Serialize an instance of GenericValue to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          stringifiedType: @stringified_type,
          stringifiedValue: @stringified_value
        }.to_json
      end
    end
  end
end
