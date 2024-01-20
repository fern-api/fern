# frozen_string_literal: true

module SeedClient
  module V2
    module V3
      module Problem
        class TestCaseImplementation
          attr_reader :description, :function, :additional_properties

          # @param description [V2::V3::Problem::TestCaseImplementationDescription]
          # @param function [V2::V3::Problem::TestCaseFunction]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::TestCaseImplementation]
          def initialze(description:, function:, additional_properties: nil)
            # @type [V2::V3::Problem::TestCaseImplementationDescription]
            @description = description
            # @type [V2::V3::Problem::TestCaseFunction]
            @function = function
            # @type [OpenStruct]
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of TestCaseImplementation
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::TestCaseImplementation]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            description = V2::V3::Problem::TestCaseImplementationDescription.from_json(json_object: struct.description)
            function = V2::V3::Problem::TestCaseFunction.from_json(json_object: struct.function)
            new(description: description, function: function, additional_properties: struct)
          end

          # Serialize an instance of TestCaseImplementation to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            {
              description: @description,
              function: @function
            }.to_json
          end
        end
      end
    end
  end
end
