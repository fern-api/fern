# frozen_string_literal: true

require_relative "commons/types/ProblemId"
require_relative "problem/types/ProblemDescription"
require "set"
require_relative "v_2/problem/types/CustomFiles"
require_relative "v_2/problem/types/GeneratedFiles"
require_relative "v_2/problem/types/TestCaseTemplate"
require_relative "v_2/problem/types/TestCaseV2"
require "json"

module SeedClient
  module V2
    module Problem
      class ProblemInfoV2
        attr_reader :problem_id, :problem_description, :problem_name, :problem_version, :supported_languages,
                    :custom_files, :generated_files, :custom_test_case_templates, :testcases, :is_public, :additional_properties

        # @param problem_id [Commons::ProblemId]
        # @param problem_description [Problem::ProblemDescription]
        # @param problem_name [String]
        # @param problem_version [Integer]
        # @param supported_languages [Set<Commons::Language>]
        # @param custom_files [V2::Problem::CustomFiles]
        # @param generated_files [V2::Problem::GeneratedFiles]
        # @param custom_test_case_templates [Array<V2::Problem::TestCaseTemplate>]
        # @param testcases [Array<V2::Problem::TestCaseV2>]
        # @param is_public [Boolean]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::ProblemInfoV2]
        def initialze(problem_id:, problem_description:, problem_name:, problem_version:, supported_languages:,
                      custom_files:, generated_files:, custom_test_case_templates:, testcases:, is_public:, additional_properties: nil)
          # @type [Commons::ProblemId]
          @problem_id = problem_id
          # @type [Problem::ProblemDescription]
          @problem_description = problem_description
          # @type [String]
          @problem_name = problem_name
          # @type [Integer]
          @problem_version = problem_version
          # @type [Set<Commons::Language>]
          @supported_languages = supported_languages
          # @type [V2::Problem::CustomFiles]
          @custom_files = custom_files
          # @type [V2::Problem::GeneratedFiles]
          @generated_files = generated_files
          # @type [Array<V2::Problem::TestCaseTemplate>]
          @custom_test_case_templates = custom_test_case_templates
          # @type [Array<V2::Problem::TestCaseV2>]
          @testcases = testcases
          # @type [Boolean]
          @is_public = is_public
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of ProblemInfoV2
        #
        # @param json_object [JSON]
        # @return [V2::Problem::ProblemInfoV2]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          problem_id = Commons::ProblemId.from_json(json_object: struct.problemId)
          problem_description = Problem::ProblemDescription.from_json(json_object: struct.problemDescription)
          problem_name = struct.problemName
          problem_version = struct.problemVersion
          supported_languages = Set.new(struct.supportedLanguages)
          custom_files = V2::Problem::CustomFiles.from_json(json_object: struct.customFiles)
          generated_files = V2::Problem::GeneratedFiles.from_json(json_object: struct.generatedFiles)
          custom_test_case_templates = struct.customTestCaseTemplates.map do |v|
            V2::Problem::TestCaseTemplate.from_json(json_object: v)
          end
          testcases = struct.testcases.map do |v|
            V2::Problem::TestCaseV2.from_json(json_object: v)
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
            problemId: @problem_id,
            problemDescription: @problem_description,
            problemName: @problem_name,
            problemVersion: @problem_version,
            supportedLanguages: @supported_languages.to_a,
            customFiles: @custom_files,
            generatedFiles: @generated_files,
            customTestCaseTemplates: @custom_test_case_templates,
            testcases: @testcases,
            isPublic: @is_public
          }.to_json
        end
      end
    end
  end
end
