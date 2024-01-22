# frozen_string_literal: true
require "json"

module SeedClient
  module V2
    module Problem
      class GetBasicSolutionFileResponse
        attr_reader :solution_file_by_language, :additional_properties
        # @param solution_file_by_language [Hash{Commons::Language => Commons::Language}] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::GetBasicSolutionFileResponse] 
        def initialze(solution_file_by_language:, additional_properties: nil)
          # @type [Hash{Commons::Language => Commons::Language}] 
          @solution_file_by_language = solution_file_by_language
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of GetBasicSolutionFileResponse
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::GetBasicSolutionFileResponse] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          solution_file_by_language struct.solutionFileByLanguage.transform_values() do | v |
  Commons::Language.from_json(json_object: v)
end
          new(solution_file_by_language: solution_file_by_language, additional_properties: struct)
        end
        # Serialize an instance of GetBasicSolutionFileResponse to a JSON object
        #
        # @return [JSON] 
        def to_json
          { solutionFileByLanguage: @solution_file_by_language.transform_values() do | v |
  Commons::Language.from_json(json_object: v)
end }.to_json()
        end
        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object] 
        # @return [Void] 
        def self.validate_raw(obj:)
          obj.solution_file_by_language.is_a?(Hash) != false || raise("Passed value for field obj.solution_file_by_language is not the expected type, validation failed.")
        end
      end
    end
  end
end