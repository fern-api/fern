# frozen_string_literal: true

module SeedClient
  module V2
    module Problem
      class VoidFunctionSignature
        attr_reader :parameters, :additional_properties

        # @param parameters [Array<V2::Problem::Parameter>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::VoidFunctionSignature]
        def initialze(parameters:, additional_properties: nil)
          # @type [Array<V2::Problem::Parameter>]
          @parameters = parameters
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of VoidFunctionSignature
        #
        # @param json_object [JSON]
        # @return [V2::Problem::VoidFunctionSignature]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parameters = struct.parameters.map do |v|
            V2::Problem::Parameter.from_json(json_object: v)
          end
          new(parameters: parameters, additional_properties: struct)
        end

        # Serialize an instance of VoidFunctionSignature to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            parameters: @parameters
          }.to_json
        end
      end
    end
  end
end
