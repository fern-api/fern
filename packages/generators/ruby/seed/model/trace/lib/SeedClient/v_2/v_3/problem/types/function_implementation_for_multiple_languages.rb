# frozen_string_literal: true
require "json"

module SeedClient
  module V2
    module V3
      module Problem
        class FunctionImplementationForMultipleLanguages
          attr_reader :code_by_language, :additional_properties
          # @param code_by_language [Hash{Commons::Language => Commons::Language}] 
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::FunctionImplementationForMultipleLanguages] 
          def initialze(code_by_language:, additional_properties: nil)
            # @type [Hash{Commons::Language => Commons::Language}] 
            @code_by_language = code_by_language
            # @type [OpenStruct] 
            @additional_properties = additional_properties
          end
          # Deserialize a JSON object to an instance of FunctionImplementationForMultipleLanguages
          #
          # @param json_object [JSON] 
          # @return [V2::V3::Problem::FunctionImplementationForMultipleLanguages] 
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            code_by_language = struct.codeByLanguage.transform_values() do | v |
 Commons::Language.from_json(json_object: v)
end
            new(code_by_language: code_by_language, additional_properties: struct)
          end
          # Serialize an instance of FunctionImplementationForMultipleLanguages to a JSON object
          #
          # @return [JSON] 
          def to_json
            {
 codeByLanguage: @code_by_language.transform_values() do | v |\n Commons::Language.from_json(json_object: v)\nend
}.to_json()
          end
        end
      end
    end
  end
end