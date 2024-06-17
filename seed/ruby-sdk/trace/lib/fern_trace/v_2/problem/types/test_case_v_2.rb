# frozen_string_literal: true

require_relative "test_case_metadata"
require_relative "test_case_implementation_reference"
require_relative "test_case_expects"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class TestCaseV2
        # @return [V2::TestCaseMetadata]
        attr_reader :metadata
        # @return [V2::TestCaseImplementationReference]
        attr_reader :implementation
        # @return [Hash{String => VariableValue}]
        attr_reader :arguments
        # @return [V2::TestCaseExpects]
        attr_reader :expects
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param metadata [V2::TestCaseMetadata]
        # @param implementation [V2::TestCaseImplementationReference]
        # @param arguments [Hash{String => VariableValue}]
        # @param expects [V2::TestCaseExpects]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::TestCaseV2]
        def initialize(metadata:, implementation:, arguments:, expects: OMIT, additional_properties: nil)
          @metadata = metadata
          @implementation = implementation
          @arguments = arguments
          @expects = expects if expects != OMIT
          @additional_properties = additional_properties
          @_field_set = {
            "metadata": metadata,
            "implementation": implementation,
            "arguments": arguments,
            "expects": expects
          }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of TestCaseV2
        #
        # @param json_object [String]
        # @return [V2::TestCaseV2]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          if parsed_json["metadata"].nil?
            metadata = nil
          else
            metadata = parsed_json["metadata"].to_json
            metadata = V2::TestCaseMetadata.from_json(json_object: metadata)
          end
          if parsed_json["implementation"].nil?
            implementation = nil
          else
            implementation = parsed_json["implementation"].to_json
            implementation = V2::TestCaseImplementationReference.from_json(json_object: implementation)
          end
          arguments = parsed_json["arguments"]&.transform_values do |v|
            v = v.to_json
            VariableValue.from_json(json_object: v)
          end
          if parsed_json["expects"].nil?
            expects = nil
          else
            expects = parsed_json["expects"].to_json
            expects = V2::TestCaseExpects.from_json(json_object: expects)
          end
          new(
            metadata: metadata,
            implementation: implementation,
            arguments: arguments,
            expects: expects,
            additional_properties: struct
          )
        end

        # Serialize an instance of TestCaseV2 to a JSON object
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
          V2::TestCaseMetadata.validate_raw(obj: obj.metadata)
          V2::TestCaseImplementationReference.validate_raw(obj: obj.implementation)
          obj.arguments.is_a?(Hash) != false || raise("Passed value for field obj.arguments is not the expected type, validation failed.")
          obj.expects.nil? || V2::TestCaseExpects.validate_raw(obj: obj.expects)
        end
      end
    end
  end
end
