# frozen_string_literal: true

require_relative "../../../../commons/types/problem_id"
require_relative "../../../../problem/types/problem_description"
require "set"
require_relative "custom_files"
require_relative "generated_files"
require_relative "test_case_template"
require_relative "test_case_v_2"
require "json"

module SeedTraceClient
  module V2
    module V3
      module Problem
        class ProblemInfoV2
          attr_reader :problem_id, :problem_description, :problem_name, :problem_version, :supported_languages,
                      :custom_files, :generated_files, :custom_test_case_templates, :testcases, :is_public, :additional_properties

          # @param problem_id [Commons::PROBLEM_ID]
          # @param problem_description [Problem::ProblemDescription]
          # @param problem_name [String]
          # @param problem_version [Integer]
          # @param supported_languages [Set<LANGUAGE>]
          # @param custom_files [V2::V3::Problem::CustomFiles]
          # @param generated_files [V2::V3::Problem::GeneratedFiles]
          # @param custom_test_case_templates [Array<V2::V3::Problem::TestCaseTemplate>]
          # @param testcases [Array<V2::V3::Problem::TestCaseV2>]
          # @param is_public [Boolean]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::ProblemInfoV2]
          def initialize(problem_id:, problem_description:, problem_name:, problem_version:, supported_languages:,
                         custom_files:, generated_files:, custom_test_case_templates:, testcases:, is_public:, additional_properties: nil)
            # @type [Commons::PROBLEM_ID]
            @problem_id = problem_id
            # @type [Problem::ProblemDescription]
            @problem_description = problem_description
            # @type [String]
            @problem_name = problem_name
            # @type [Integer]
            @problem_version = problem_version
            # @type [Set<LANGUAGE>]
            @supported_languages = supported_languages
            # @type [V2::V3::Problem::CustomFiles]
            @custom_files = custom_files
            # @type [V2::V3::Problem::GeneratedFiles]
            @generated_files = generated_files
            # @type [Array<V2::V3::Problem::TestCaseTemplate>]
            @custom_test_case_templates = custom_test_case_templates
            # @type [Array<V2::V3::Problem::TestCaseV2>]
            @testcases = testcases
            # @type [Boolean]
            @is_public = is_public
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of ProblemInfoV2
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::ProblemInfoV2]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            problem_id = struct.problemId
            problem_description = struct.problemDescription.to_h.to_json
            problem_description = Problem::ProblemDescription.from_json(json_object: problem_description)
            problem_name = struct.problemName
            problem_version = struct.problemVersion
            supported_languages = struct.supportedLanguages.to_h.to_json
            supported_languages = Set.new(supported_languages)
            custom_files = struct.customFiles.to_h.to_json
            custom_files = V2::V3::Problem::CustomFiles.from_json(json_object: custom_files)
            generated_files = struct.generatedFiles.to_h.to_json
            generated_files = V2::V3::Problem::GeneratedFiles.from_json(json_object: generated_files)
            custom_test_case_templates = struct.customTestCaseTemplates.map do |v|
              v = v.to_h.to_json
              V2::V3::Problem::TestCaseTemplate.from_json(json_object: v)
            end
            testcases = struct.testcases.map do |v|
              v = v.to_h.to_json
              V2::V3::Problem::TestCaseV2.from_json(json_object: v)
            end
            is_public = struct.isPublic
            new(problem_id: problem_id, problem_description: problem_description, problem_name: problem_name,
                problem_version: problem_version, supported_languages: supported_languages, custom_files: custom_files, generated_files: generated_files, custom_test_case_templates: custom_test_case_templates, testcases: testcases, is_public: is_public, additional_properties: struct)
          end

          # Serialize an instance of ProblemInfoV2 to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            {
              "problemId": @problem_id,
              "problemDescription": @problem_description,
              "problemName": @problem_name,
              "problemVersion": @problem_version,
              "supportedLanguages": @supported_languages,
              "customFiles": @custom_files,
              "generatedFiles": @generated_files,
              "customTestCaseTemplates": @custom_test_case_templates,
              "testcases": @testcases,
              "isPublic": @is_public
            }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
            Problem::ProblemDescription.validate_raw(obj: obj.problem_description)
            obj.problem_name.is_a?(String) != false || raise("Passed value for field obj.problem_name is not the expected type, validation failed.")
            obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
            obj.supported_languages.is_a?(Set) != false || raise("Passed value for field obj.supported_languages is not the expected type, validation failed.")
            V2::V3::Problem::CustomFiles.validate_raw(obj: obj.custom_files)
            V2::V3::Problem::GeneratedFiles.validate_raw(obj: obj.generated_files)
            obj.custom_test_case_templates.is_a?(Array) != false || raise("Passed value for field obj.custom_test_case_templates is not the expected type, validation failed.")
            obj.testcases.is_a?(Array) != false || raise("Passed value for field obj.testcases is not the expected type, validation failed.")
            obj.is_public.is_a?(Boolean) != false || raise("Passed value for field obj.is_public is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
