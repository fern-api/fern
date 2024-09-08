# frozen_string_literal: true

require "ostruct"
require "json"

module SeedMixedFileDirectoryClient
  module User
    module Events
      class Metadata
        class Metadata
          # @return [String]
          attr_reader :id
          # @return [Object]
          attr_reader :value
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param id [String]
          # @param value [Object]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedMixedFileDirectoryClient::User::Events::Metadata::Metadata]
          def initialize(id:, value:, additional_properties: nil)
            @id = id
            @value = value
            @additional_properties = additional_properties
            @_field_set = { "id": id, "value": value }
          end

          # Deserialize a JSON object to an instance of Metadata
          #
          # @param json_object [String]
          # @return [SeedMixedFileDirectoryClient::User::Events::Metadata::Metadata]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            id = parsed_json["id"]
            value = parsed_json["value"]
            new(
              id: id,
              value: value,
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
            obj.value.is_a?(Object) != false || raise("Passed value for field obj.value is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
