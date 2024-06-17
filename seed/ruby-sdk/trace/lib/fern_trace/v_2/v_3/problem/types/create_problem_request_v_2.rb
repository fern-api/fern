# frozen_string_literal: true

require_relative "../../../../problem/types/problem_description"
require_relative "custom_files"
require_relative "test_case_template"
require_relative "test_case_v_2"
require "set"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class CreateProblemRequestV2
          # @return [String]
          attr_reader :problem_name
          # @return [ProblemDescription]
          attr_reader :problem_description
          # @return [V2::V3::CustomFiles]
          attr_reader :custom_files
          # @return [Array<V2::V3::TestCaseTemplate>]
          attr_reader :custom_test_case_templates
          # @return [Array<V2::V3::TestCaseV2>]
          attr_reader :testcases
          # @return [Set<Language>]
          attr_reader :supported_languages
          # @return [Boolean]
          attr_reader :is_public
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param problem_name [String]
          # @param problem_description [ProblemDescription]
          # @param custom_files [V2::V3::CustomFiles]
          # @param custom_test_case_templates [Array<V2::V3::TestCaseTemplate>]
          # @param testcases [Array<V2::V3::TestCaseV2>]
          # @param supported_languages [Set<Language>]
          # @param is_public [Boolean]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::CreateProblemRequestV2]
          def initialize(problem_name:, problem_description:, custom_files:, custom_test_case_templates:, testcases:,
                         supported_languages:, is_public:, additional_properties: nil)
            @problem_name = problem_name
            @problem_description = problem_description
            @custom_files = custom_files
            @custom_test_case_templates = custom_test_case_templates
            @testcases = testcases
            @supported_languages = supported_languages
            @is_public = is_public
            @additional_properties = additional_properties
            @_field_set = {
              "problemName": problem_name,
              "problemDescription": problem_description,
              "customFiles": custom_files,
              "customTestCaseTemplates": custom_test_case_templates,
              "testcases": testcases,
              "supportedLanguages": supported_languages,
              "isPublic": is_public
            }
          end

          # Deserialize a JSON object to an instance of CreateProblemRequestV2
          #
          # @param json_object [String]
          # @return [V2::V3::CreateProblemRequestV2]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            problem_name = struct["problemName"]
            if parsed_json["problemDescription"].nil?
              problem_description = nil
            else
              problem_description = parsed_json["problemDescription"].to_json
              problem_description = ProblemDescription.from_json(json_object: problem_description)
            end
            if parsed_json["customFiles"].nil?
              custom_files = nil
            else
              custom_files = parsed_json["customFiles"].to_json
              custom_files = V2::V3::CustomFiles.from_json(json_object: custom_files)
            end
            custom_test_case_templates = parsed_json["customTestCaseTemplates"]&.map do |v|
              v = v.to_json
              V2::V3::TestCaseTemplate.from_json(json_object: v)
            end
            testcases = parsed_json["testcases"]&.map do |v|
              v = v.to_json
              V2::V3::TestCaseV2.from_json(json_object: v)
            end
            if parsed_json["supportedLanguages"].nil?
              supported_languages = nil
            else
              supported_languages = parsed_json["supportedLanguages"].to_json
              supported_languages = Set.new(supported_languages)
            end
            is_public = struct["isPublic"]
            new(
              problem_name: problem_name,
              problem_description: problem_description,
              custom_files: custom_files,
              custom_test_case_templates: custom_test_case_templates,
              testcases: testcases,
              supported_languages: supported_languages,
              is_public: is_public,
              additional_properties: struct
            )
          end

          # Serialize an instance of CreateProblemRequestV2 to a JSON object
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
            obj.problem_name.is_a?(String) != false || raise("Passed value for field obj.problem_name is not the expected type, validation failed.")
            ProblemDescription.validate_raw(obj: obj.problem_description)
            V2::V3::CustomFiles.validate_raw(obj: obj.custom_files)
            obj.custom_test_case_templates.is_a?(Array) != false || raise("Passed value for field obj.custom_test_case_templates is not the expected type, validation failed.")
            obj.testcases.is_a?(Array) != false || raise("Passed value for field obj.testcases is not the expected type, validation failed.")
            obj.supported_languages.is_a?(Set) != false || raise("Passed value for field obj.supported_languages is not the expected type, validation failed.")
            obj.is_public.is_a?(Boolean) != false || raise("Passed value for field obj.is_public is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
