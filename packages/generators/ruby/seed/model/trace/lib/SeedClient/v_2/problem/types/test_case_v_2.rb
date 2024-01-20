# frozen_string_literal: true

module SeedClient
  module V2
    module Problem
      class TestCaseV2
        attr_reader :metadata, :implementation, :arguments, :expects, :additional_properties
        # @param metadata [V2::Problem::TestCaseMetadata] 
        # @param implementation [V2::Problem::TestCaseImplementationReference] 
        # @param arguments [Hash{V2::Problem::ParameterId => V2::Problem::ParameterId}] 
        # @param expects [V2::Problem::TestCaseExpects] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::TestCaseV2] 
        def initialze(metadata:, implementation:, arguments:, expects: nil, additional_properties: nil)
          # @type [V2::Problem::TestCaseMetadata] 
          @metadata = metadata
          # @type [V2::Problem::TestCaseImplementationReference] 
          @implementation = implementation
          # @type [Hash{V2::Problem::ParameterId => V2::Problem::ParameterId}] 
          @arguments = arguments
          # @type [V2::Problem::TestCaseExpects] 
          @expects = expects
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of TestCaseV2
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::TestCaseV2] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          metadata = V2::Problem::TestCaseMetadata.from_json(json_object: struct.metadata)
          implementation = V2::Problem::TestCaseImplementationReference.from_json(json_object: struct.implementation)
          arguments = struct.arguments.transform_values() do | v |
 V2::Problem::ParameterId.from_json(json_object: v)
end
          expects = V2::Problem::TestCaseExpects.from_json(json_object: struct.expects)
          new(metadata: metadata, implementation: implementation, arguments: arguments, expects: expects, additional_properties: struct)
        end
        # Serialize an instance of TestCaseV2 to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 metadata: @metadata,
 implementation: @implementation,
 arguments: @arguments.transform_values() do | v |\n V2::Problem::ParameterId.from_json(json_object: v)\nend,
 expects: @expects
}.to_json()
        end
      end
    end
  end
end