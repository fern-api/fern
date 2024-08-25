# frozen_string_literal: true

require_relative "../../../problem/types/problem_description"
require_relative "custom_files"
require_relative "test_case_template"
require_relative "test_case_v_2"
require "set"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class CreateProblemRequestV2
        # @return [String]
        attr_reader :problem_name
        # @return [SeedTraceClient::Problem::ProblemDescription]
        attr_reader :problem_description
        # @return [SeedTraceClient::V2::Problem::CustomFiles]
        attr_reader :custom_files
        # @return [Array<SeedTraceClient::V2::Problem::TestCaseTemplate>]
        attr_reader :custom_test_case_templates
        # @return [Array<SeedTraceClient::V2::Problem::TestCaseV2>]
        attr_reader :testcases
        # @return [Set<SeedTraceClient::Commons::Language>]
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
        # @param problem_description [SeedTraceClient::Problem::ProblemDescription]
        # @param custom_files [SeedTraceClient::V2::Problem::CustomFiles]
        # @param custom_test_case_templates [Array<SeedTraceClient::V2::Problem::TestCaseTemplate>]
        # @param testcases [Array<SeedTraceClient::V2::Problem::TestCaseV2>]
        # @param supported_languages [Set<SeedTraceClient::Commons::Language>]
        # @param is_public [Boolean]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedTraceClient::V2::Problem::CreateProblemRequestV2]
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
        # @return [SeedTraceClient::V2::Problem::CreateProblemRequestV2]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          problem_name = parsed_json["problemName"]
          if parsed_json["problemDescription"].nil?
            problem_description = nil
          else
            problem_description = parsed_json["problemDescription"].to_json
            problem_description = SeedTraceClient::Problem::ProblemDescription.from_json(json_object: problem_description)
          end
          if parsed_json["customFiles"].nil?
            custom_files = nil
          else
            custom_files = parsed_json["customFiles"].to_json
            custom_files = SeedTraceClient::V2::Problem::CustomFiles.from_json(json_object: custom_files)
          end
          custom_test_case_templates = parsed_json["customTestCaseTemplates"]&.map do |item|
            item = item.to_json
            SeedTraceClient::V2::Problem::TestCaseTemplate.from_json(json_object: item)
          end
          testcases = parsed_json["testcases"]&.map do |item|
            item = item.to_json
            SeedTraceClient::V2::Problem::TestCaseV2.from_json(json_object: item)
          end
          if parsed_json["supportedLanguages"].nil?
            supported_languages = nil
          else
            supported_languages = parsed_json["supportedLanguages"].to_json
            supported_languages = Set.new(supported_languages)
          end
          is_public = parsed_json["isPublic"]
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
          SeedTraceClient::Problem::ProblemDescription.validate_raw(obj: obj.problem_description)
          SeedTraceClient::V2::Problem::CustomFiles.validate_raw(obj: obj.custom_files)
          obj.custom_test_case_templates.is_a?(Array) != false || raise("Passed value for field obj.custom_test_case_templates is not the expected type, validation failed.")
          obj.testcases.is_a?(Array) != false || raise("Passed value for field obj.testcases is not the expected type, validation failed.")
          obj.supported_languages.is_a?(Set) != false || raise("Passed value for field obj.supported_languages is not the expected type, validation failed.")
          obj.is_public.is_a?(Boolean) != false || raise("Passed value for field obj.is_public is not the expected type, validation failed.")
        end
      end
    end
  end
end
