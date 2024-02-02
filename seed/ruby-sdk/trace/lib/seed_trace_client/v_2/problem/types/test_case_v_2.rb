# frozen_string_literal: true

require_relative "test_case_metadata"
require_relative "test_case_implementation_reference"
require_relative "test_case_expects"
require "json"

module SeedTraceClient
  module V2
    module Problem
      class TestCaseV2
        attr_reader :metadata, :implementation, :arguments, :expects, :additional_properties

        # @param metadata [V2::Problem::TestCaseMetadata]
        # @param implementation [V2::Problem::TestCaseImplementationReference]
        # @param arguments [Hash{V2::Problem::PARAMETER_ID => V2::Problem::PARAMETER_ID}]
        # @param expects [V2::Problem::TestCaseExpects]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::TestCaseV2]
        def initialize(metadata:, implementation:, arguments:, expects: nil, additional_properties: nil)
          # @type [V2::Problem::TestCaseMetadata]
          @metadata = metadata
          # @type [V2::Problem::TestCaseImplementationReference]
          @implementation = implementation
          # @type [Hash{V2::Problem::PARAMETER_ID => V2::Problem::PARAMETER_ID}]
          @arguments = arguments
          # @type [V2::Problem::TestCaseExpects]
          @expects = expects
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of TestCaseV2
        #
        # @param json_object [JSON]
        # @return [V2::Problem::TestCaseV2]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          metadata = struct.metadata
          implementation = struct.implementation
          arguments = struct.arguments
          expects = struct.expects
          new(metadata: metadata, implementation: implementation, arguments: arguments, expects: expects,
              additional_properties: struct)
        end

        # Serialize an instance of TestCaseV2 to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            "metadata": @metadata,
            "implementation": @implementation,
            "arguments": @arguments,
            "expects": @expects
          }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          V2::Problem::TestCaseMetadata.validate_raw(obj: obj.metadata)
          V2::Problem::TestCaseImplementationReference.validate_raw(obj: obj.implementation)
          obj.arguments.is_a?(Hash) != false || raise("Passed value for field obj.arguments is not the expected type, validation failed.")
          obj.expects.nil? || V2::Problem::TestCaseExpects.validate_raw(obj: obj.expects)
        end
      end
    end
  end
end
