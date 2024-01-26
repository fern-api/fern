# frozen_string_literal: true

require "json"

module SeedClient
  module Commons
    module Types
      class Metadata
        attr_reader :id, :data, :json_string, :additional_properties

        # @param id [String]
        # @param data [Hash{String => String}]
        # @param json_string [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Commons::Types::Metadata]
        def initialize(id:, data: nil, json_string: nil, additional_properties: nil)
          # @type [String]
          @id = id
          # @type [Hash{String => String}]
          @data = data
          # @type [String]
          @json_string = json_string
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of Metadata
        #
        # @param json_object [JSON]
        # @return [Commons::Types::Metadata]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          id = struct.id
          data = struct.data
          json_string = struct.jsonString
          new(id: id, data: data, json_string: json_string, additional_properties: struct)
        end

        # Serialize an instance of Metadata to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "id": @id, "data": @data, "jsonString": @json_string }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
          obj.data&.is_a?(Hash) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
          obj.json_string&.is_a?(String) != false || raise("Passed value for field obj.json_string is not the expected type, validation failed.")
        end
      end
    end
  end
end
