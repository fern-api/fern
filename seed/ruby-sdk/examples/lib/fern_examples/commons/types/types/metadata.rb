# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  module Commons
    class Types
      class Metadata
        # @return [String]
        attr_reader :id
        # @return [Hash{String => String}]
        attr_reader :data
        # @return [String]
        attr_reader :json_string
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param id [String]
        # @param data [Hash{String => String}]
        # @param json_string [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExamplesClient::Commons::Types::Metadata]
        def initialize(id:, data: OMIT, json_string: OMIT, additional_properties: nil)
          @id = id
          @data = data if data != OMIT
          @json_string = json_string if json_string != OMIT
          @additional_properties = additional_properties
          @_field_set = { "id": id, "data": data, "jsonString": json_string }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of Metadata
        #
        # @param json_object [String]
        # @return [SeedExamplesClient::Commons::Types::Metadata]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          id = parsed_json["id"]
          data = parsed_json["data"]
          json_string = parsed_json["jsonString"]
          new(
            id: id,
            data: data,
            json_string: json_string,
            additional_properties: struct
          )
        end

        # Serialize an instance of Metadata to a JSON object
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
          obj.data&.is_a?(Hash) != false || raise("Passed value for field obj.data is not the expected type, validation failed.")
          obj.json_string&.is_a?(String) != false || raise("Passed value for field obj.json_string is not the expected type, validation failed.")
        end
      end
    end
  end
end
