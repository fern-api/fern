# frozen_string_literal: true

require_relative "problem/types/ProblemDescription"
require_relative "v_2/problem/types/CustomFiles"
require_relative "v_2/problem/types/TestCaseTemplate"
require_relative "v_2/problem/types/TestCaseV2"
require "set"
require "json"

module SeedClient
  module V2
    module Problem
      class CreateProblemRequestV2
        attr_reader :problem_name, :problem_description, :custom_files, :custom_test_case_templates, :testcases,
                    :supported_languages, :is_public, :additional_properties

        # @param problem_name [String]
        # @param problem_description [Problem::ProblemDescription]
        # @param custom_files [V2::Problem::CustomFiles]
        # @param custom_test_case_templates [Array<V2::Problem::TestCaseTemplate>]
        # @param testcases [Array<V2::Problem::TestCaseV2>]
        # @param supported_languages [Set<Commons::Language>]
        # @param is_public [Boolean]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::CreateProblemRequestV2]
        def initialze(problem_name:, problem_description:, custom_files:, custom_test_case_templates:, testcases:,
                      supported_languages:, is_public:, additional_properties: nil)
          # @type [String]
          @problem_name = problem_name
          # @type [Problem::ProblemDescription]
          @problem_description = problem_description
          # @type [V2::Problem::CustomFiles]
          @custom_files = custom_files
          # @type [Array<V2::Problem::TestCaseTemplate>]
          @custom_test_case_templates = custom_test_case_templates
          # @type [Array<V2::Problem::TestCaseV2>]
          @testcases = testcases
          # @type [Set<Commons::Language>]
          @supported_languages = supported_languages
          # @type [Boolean]
          @is_public = is_public
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of CreateProblemRequestV2
        #
        # @param json_object [JSON]
        # @return [V2::Problem::CreateProblemRequestV2]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          problem_name = struct.problemName
          problem_description = Problem::ProblemDescription.from_json(json_object: struct.problemDescription)
          custom_files = V2::Problem::CustomFiles.from_json(json_object: struct.customFiles)
          custom_test_case_templates = struct.customTestCaseTemplates.map do |v|
            V2::Problem::TestCaseTemplate.from_json(json_object: v)
          end
          testcases = struct.testcases.map do |v|
            V2::Problem::TestCaseV2.from_json(json_object: v)
          end
          supported_languages = Set.new(struct.supportedLanguages)
          is_public = struct.isPublic
          new(problem_name: problem_name, problem_description: problem_description, custom_files: custom_files,
              custom_test_case_templates: custom_test_case_templates, testcases: testcases, supported_languages: supported_languages, is_public: is_public, additional_properties: struct)
        end

        # Serialize an instance of CreateProblemRequestV2 to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            problemName: @problem_name,
            problemDescription: @problem_description,
            customFiles: @custom_files,
            customTestCaseTemplates: @custom_test_case_templates,
            testcases: @testcases,
            supportedLanguages: @supported_languages.to_a,
            isPublic: @is_public
          }.to_json
        end
      end
    end
  end
end
