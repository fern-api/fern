# frozen_string_literal: true

module SeedClient
  module V2
    module V3
      module Problem
        class GetBasicSolutionFileRequest
          attr_reader :method_name, :signature, :additional_properties
          # @param method_name [String] 
          # @param signature [V2::V3::Problem::NonVoidFunctionSignature] 
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::GetBasicSolutionFileRequest] 
          def initialze(method_name:, signature:, additional_properties: nil)
            # @type [String] 
            @method_name = method_name
            # @type [V2::V3::Problem::NonVoidFunctionSignature] 
            @signature = signature
            # @type [OpenStruct] 
            @additional_properties = additional_properties
          end
          # Deserialize a JSON object to an instance of GetBasicSolutionFileRequest
          #
          # @param json_object [JSON] 
          # @return [V2::V3::Problem::GetBasicSolutionFileRequest] 
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            method_name = struct.methodName
            signature = V2::V3::Problem::NonVoidFunctionSignature.from_json(json_object: struct.signature)
            new(method_name: method_name, signature: signature, additional_properties: struct)
          end
          # Serialize an instance of GetBasicSolutionFileRequest to a JSON object
          #
          # @return [JSON] 
          def to_json
            {
 methodName: @method_name,
 signature: @signature
}.to_json()
          end
        end
      end
    end
  end
end