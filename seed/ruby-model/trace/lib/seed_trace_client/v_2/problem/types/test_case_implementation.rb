# frozen_string_literal: true

require_relative "test_case_function"

require_relative "test_case_implementation_description"
require "json"

module SeedTraceClient
  module V2
    module Problem
      class TestCaseImplementation
        attr_reader :description, :function, :additional_properties

        # @param description [V2::Problem::TestCaseImplementationDescription]
        # @param function [V2::Problem::TestCaseFunction]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::TestCaseImplementation]
        def initialize(description:, function:, additional_properties: nil)
          # @type [V2::Problem::TestCaseImplementationDescription]
          @description = description
          # @type [V2::Problem::TestCaseFunction]
          @function = function
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of TestCaseImplementation
        #
        # @param json_object [JSON]
        # @return [V2::Problem::TestCaseImplementation]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          description = struct.description
          function = struct.function
          new(description: description, function: function, additional_properties: struct)
        end

        # Serialize an instance of TestCaseImplementation to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "description": @description, "function": @function }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          V2::Problem::TestCaseImplementationDescription.validate_raw(obj: obj.description)
          V2::Problem::TestCaseFunction.validate_raw(obj: obj.function)
        end
      end
    end
  end
end
