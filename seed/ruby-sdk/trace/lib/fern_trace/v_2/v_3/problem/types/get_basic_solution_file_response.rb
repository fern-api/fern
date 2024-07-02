# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class GetBasicSolutionFileResponse
          # @return [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::V2::V3::Problem::FileInfoV2}]
          attr_reader :solution_file_by_language
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param solution_file_by_language [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::V2::V3::Problem::FileInfoV2}]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::GetBasicSolutionFileResponse]
          def initialize(solution_file_by_language:, additional_properties: nil)
            @solution_file_by_language = solution_file_by_language
            @additional_properties = additional_properties
            @_field_set = { "solutionFileByLanguage": solution_file_by_language }
          end

          # Deserialize a JSON object to an instance of GetBasicSolutionFileResponse
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::GetBasicSolutionFileResponse]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            solution_file_by_language = parsed_json["solutionFileByLanguage"]&.transform_values do |value|
              value = value.to_json
              SeedTraceClient::V2::V3::Problem::FileInfoV2.from_json(json_object: value)
            end
            new(solution_file_by_language: solution_file_by_language, additional_properties: struct)
          end

          # Serialize an instance of GetBasicSolutionFileResponse to a JSON object
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
            obj.solution_file_by_language.is_a?(Hash) != false || raise("Passed value for field obj.solution_file_by_language is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
