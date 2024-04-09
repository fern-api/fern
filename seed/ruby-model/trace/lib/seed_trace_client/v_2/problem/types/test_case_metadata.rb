# frozen_string_literal: true

require_relative "test_case_id"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class TestCaseMetadata
        attr_reader :id, :name, :hidden, :additional_properties, :_field_set
        protected :_field_set
        OMIT = Object.new
        # @param id [SeedTraceClient::V2::Problem::TEST_CASE_ID]
        # @param name [String]
        # @param hidden [Boolean]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedTraceClient::V2::Problem::TestCaseMetadata]
        def initialize(id:, name:, hidden:, additional_properties: nil)
          # @type [SeedTraceClient::V2::Problem::TEST_CASE_ID]
          @id = id
          # @type [String]
          @name = name
          # @type [Boolean]
          @hidden = hidden
          @_field_set = { "id": @id, "name": @name, "hidden": @hidden }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of TestCaseMetadata
        #
        # @param json_object [String]
        # @return [SeedTraceClient::V2::Problem::TestCaseMetadata]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          id = struct["id"]
          name = struct["name"]
          hidden = struct["hidden"]
          new(id: id, name: name, hidden: hidden, additional_properties: struct)
        end

        # Serialize an instance of TestCaseMetadata to a JSON object
        #
        # @return [String]
        def to_json(*_args)
          @_field_set&.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
