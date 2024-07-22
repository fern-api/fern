# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class TestCaseMetadata
          # @return [String]
          attr_reader :id
          # @return [String]
          attr_reader :name
          # @return [Boolean]
          attr_reader :hidden
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param id [String]
          # @param name [String]
          # @param hidden [Boolean]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseMetadata]
          def initialize(id:, name:, hidden:, additional_properties: nil)
            @id = id
            @name = name
            @hidden = hidden
            @additional_properties = additional_properties
            @_field_set = { "id": id, "name": name, "hidden": hidden }
          end

          # Deserialize a JSON object to an instance of TestCaseMetadata
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseMetadata]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            id = parsed_json["id"]
            name = parsed_json["name"]
            hidden = parsed_json["hidden"]
            new(
              id: id,
              name: name,
              hidden: hidden,
              additional_properties: struct
            )
          end

          # Serialize an instance of TestCaseMetadata to a JSON object
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
            obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
            obj.hidden.is_a?(Boolean) != false || raise("Passed value for field obj.hidden is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
