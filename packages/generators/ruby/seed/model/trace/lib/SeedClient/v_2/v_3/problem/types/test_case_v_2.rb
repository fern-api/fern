# frozen_string_literal: true

require_relative "v_2/v_3/problem/types/TestCaseMetadata"
require_relative "v_2/v_3/problem/types/TestCaseImplementationReference"
require_relative "v_2/v_3/problem/types/TestCaseExpects"
require "json"

module SeedClient
  module V2
    module V3
      module Problem
        class TestCaseV2
          attr_reader :metadata, :implementation, :arguments, :expects, :additional_properties

          # @param metadata [V2::V3::Problem::TestCaseMetadata]
          # @param implementation [V2::V3::Problem::TestCaseImplementationReference]
          # @param arguments [Hash{V2::V3::Problem::PARAMETER_ID => V2::V3::Problem::PARAMETER_ID}]
          # @param expects [V2::V3::Problem::TestCaseExpects]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::TestCaseV2]
          def initialze(metadata:, implementation:, arguments:, expects: nil, additional_properties: nil)
            # @type [V2::V3::Problem::TestCaseMetadata]
            @metadata = metadata
            # @type [V2::V3::Problem::TestCaseImplementationReference]
            @implementation = implementation
            # @type [Hash{V2::V3::Problem::PARAMETER_ID => V2::V3::Problem::PARAMETER_ID}]
            @arguments = arguments
            # @type [V2::V3::Problem::TestCaseExpects]
            @expects = expects
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of TestCaseV2
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::TestCaseV2]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            metadata = V2::V3::Problem::TestCaseMetadata.from_json(json_object: struct.metadata)
            implementation = V2::V3::Problem::TestCaseImplementationReference.from_json(json_object: struct.implementation)
            arguments = struct.arguments
            expects = V2::V3::Problem::TestCaseExpects.from_json(json_object: struct.expects)
            new(metadata: metadata, implementation: implementation, arguments: arguments, expects: expects,
                additional_properties: struct)
          end

          # Serialize an instance of TestCaseV2 to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { metadata: @metadata, implementation: @implementation, arguments: @arguments, expects: @expects }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            V2::V3::Problem::TestCaseMetadata.validate_raw(obj: obj.metadata)
            V2::V3::Problem::TestCaseImplementationReference.validate_raw(obj: obj.implementation)
            obj.arguments.is_a?(Hash) != false || raise("Passed value for field obj.arguments is not the expected type, validation failed.")
            obj.expects.nil? || V2::V3::Problem::TestCaseExpects.validate_raw(obj: obj.expects)
          end
        end
      end
    end
  end
end
