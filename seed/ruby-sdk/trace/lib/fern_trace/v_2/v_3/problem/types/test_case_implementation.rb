# frozen_string_literal: true

require_relative "test_case_implementation_description"
require_relative "test_case_function"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class TestCaseImplementation
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription]
          attr_reader :description
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseFunction]
          attr_reader :function
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param description [SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription]
          # @param function [SeedTraceClient::V2::V3::Problem::TestCaseFunction]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseImplementation]
          def initialize(description:, function:, additional_properties: nil)
            @description = description
            @function = function
            @additional_properties = additional_properties
            @_field_set = { "description": description, "function": function }
          end

          # Deserialize a JSON object to an instance of TestCaseImplementation
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseImplementation]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            if parsed_json["description"].nil?
              description = nil
            else
              description = parsed_json["description"].to_json
              description = SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription.from_json(json_object: description)
            end
            if parsed_json["function"].nil?
              function = nil
            else
              function = parsed_json["function"].to_json
              function = SeedTraceClient::V2::V3::Problem::TestCaseFunction.from_json(json_object: function)
            end
            new(
              description: description,
              function: function,
              additional_properties: struct
            )
          end

          # Serialize an instance of TestCaseImplementation to a JSON object
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
            SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription.validate_raw(obj: obj.description)
            SeedTraceClient::V2::V3::Problem::TestCaseFunction.validate_raw(obj: obj.function)
          end
        end
      end
    end
  end
end
