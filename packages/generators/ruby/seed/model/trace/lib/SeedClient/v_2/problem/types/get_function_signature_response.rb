# frozen_string_literal: true
require "json"

module SeedClient
  module V2
    module Problem
      class GetFunctionSignatureResponse
        attr_reader :function_by_language, :additional_properties
        # @param function_by_language [Hash{LANGUAGE => LANGUAGE}] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::GetFunctionSignatureResponse]
        def initialze(function_by_language:, additional_properties: nil)
          # @type [Hash{LANGUAGE => LANGUAGE}] 
          @function_by_language = function_by_language
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of GetFunctionSignatureResponse
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::GetFunctionSignatureResponse]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          function_by_language = struct.functionByLanguage.transform_values() do | v |
  LANGUAGE.key(v)
end
          new(function_by_language: function_by_language, additional_properties: struct)
        end
        # Serialize an instance of GetFunctionSignatureResponse to a JSON object
        #
        # @return [JSON]
        def to_json
          { functionByLanguage: @function_by_language.transform_values() do | v |
  LANGUAGE.key(v)
end }.to_json()
        end
        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object] 
        # @return [Void]
        def self.validate_raw(obj:)
          obj.function_by_language.is_a?(Hash) != false || raise("Passed value for field obj.function_by_language is not the expected type, validation failed.")
        end
      end
    end
  end
end