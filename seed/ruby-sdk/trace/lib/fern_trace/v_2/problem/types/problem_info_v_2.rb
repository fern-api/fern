# frozen_string_literal: true

require_relative "../../../problem/types/problem_description"
require "set"
require_relative "custom_files"
require_relative "generated_files"
require_relative "test_case_template"
require_relative "test_case_v_2"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class ProblemInfoV2
        # @return [String]
        attr_reader :problem_id
        # @return [SeedTraceClient::Problem::ProblemDescription]
        attr_reader :problem_description
        # @return [String]
        attr_reader :problem_name
        # @return [Integer]
        attr_reader :problem_version
        # @return [Set<SeedTraceClient::Commons::Language>]
        attr_reader :supported_languages
        # @return [SeedTraceClient::V2::Problem::CustomFiles]
        attr_reader :custom_files
        # @return [SeedTraceClient::V2::Problem::GeneratedFiles]
        attr_reader :generated_files
        # @return [Array<SeedTraceClient::V2::Problem::TestCaseTemplate>]
        attr_reader :custom_test_case_templates
        # @return [Array<SeedTraceClient::V2::Problem::TestCaseV2>]
        attr_reader :testcases
        # @return [Boolean]
        attr_reader :is_public
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param problem_id [String]
        # @param problem_description [SeedTraceClient::Problem::ProblemDescription]
        # @param problem_name [String]
        # @param problem_version [Integer]
        # @param supported_languages [Set<SeedTraceClient::Commons::Language>]
        # @param custom_files [SeedTraceClient::V2::Problem::CustomFiles]
        # @param generated_files [SeedTraceClient::V2::Problem::GeneratedFiles]
        # @param custom_test_case_templates [Array<SeedTraceClient::V2::Problem::TestCaseTemplate>]
        # @param testcases [Array<SeedTraceClient::V2::Problem::TestCaseV2>]
        # @param is_public [Boolean]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedTraceClient::V2::Problem::ProblemInfoV2]
        def initialize(problem_id:, problem_description:, problem_name:, problem_version:, supported_languages:,
                       custom_files:, generated_files:, custom_test_case_templates:, testcases:, is_public:, additional_properties: nil)
          @problem_id = problem_id
          @problem_description = problem_description
          @problem_name = problem_name
          @problem_version = problem_version
          @supported_languages = supported_languages
          @custom_files = custom_files
          @generated_files = generated_files
          @custom_test_case_templates = custom_test_case_templates
          @testcases = testcases
          @is_public = is_public
          @additional_properties = additional_properties
          @_field_set = {
            "problemId": problem_id,
            "problemDescription": problem_description,
            "problemName": problem_name,
            "problemVersion": problem_version,
            "supportedLanguages": supported_languages,
            "customFiles": custom_files,
            "generatedFiles": generated_files,
            "customTestCaseTemplates": custom_test_case_templates,
            "testcases": testcases,
            "isPublic": is_public
          }
        end

        # Deserialize a JSON object to an instance of ProblemInfoV2
        #
        # @param json_object [String]
        # @return [SeedTraceClient::V2::Problem::ProblemInfoV2]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          problem_id = parsed_json["problemId"]
          if parsed_json["problemDescription"].nil?
            problem_description = nil
          else
            problem_description = parsed_json["problemDescription"].to_json
            problem_description = SeedTraceClient::Problem::ProblemDescription.from_json(json_object: problem_description)
          end
          problem_name = parsed_json["problemName"]
          problem_version = parsed_json["problemVersion"]
          if parsed_json["supportedLanguages"].nil?
            supported_languages = nil
          else
            supported_languages = parsed_json["supportedLanguages"].to_json
            supported_languages = Set.new(supported_languages)
          end
          if parsed_json["customFiles"].nil?
            custom_files = nil
          else
            custom_files = parsed_json["customFiles"].to_json
            custom_files = SeedTraceClient::V2::Problem::CustomFiles.from_json(json_object: custom_files)
          end
          if parsed_json["generatedFiles"].nil?
            generated_files = nil
          else
            generated_files = parsed_json["generatedFiles"].to_json
            generated_files = SeedTraceClient::V2::Problem::GeneratedFiles.from_json(json_object: generated_files)
          end
          custom_test_case_templates = parsed_json["customTestCaseTemplates"]&.map do |item|
            item = item.to_json
            SeedTraceClient::V2::Problem::TestCaseTemplate.from_json(json_object: item)
          end
          testcases = parsed_json["testcases"]&.map do |item|
            item = item.to_json
            SeedTraceClient::V2::Problem::TestCaseV2.from_json(json_object: item)
          end
          is_public = parsed_json["isPublic"]
          new(
            problem_id: problem_id,
            problem_description: problem_description,
            problem_name: problem_name,
            problem_version: problem_version,
            supported_languages: supported_languages,
            custom_files: custom_files,
            generated_files: generated_files,
            custom_test_case_templates: custom_test_case_templates,
            testcases: testcases,
            is_public: is_public,
            additional_properties: struct
          )
        end

        # Serialize an instance of ProblemInfoV2 to a JSON object
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
          obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
          SeedTraceClient::Problem::ProblemDescription.validate_raw(obj: obj.problem_description)
          obj.problem_name.is_a?(String) != false || raise("Passed value for field obj.problem_name is not the expected type, validation failed.")
          obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
          obj.supported_languages.is_a?(Set) != false || raise("Passed value for field obj.supported_languages is not the expected type, validation failed.")
          SeedTraceClient::V2::Problem::CustomFiles.validate_raw(obj: obj.custom_files)
          SeedTraceClient::V2::Problem::GeneratedFiles.validate_raw(obj: obj.generated_files)
          obj.custom_test_case_templates.is_a?(Array) != false || raise("Passed value for field obj.custom_test_case_templates is not the expected type, validation failed.")
          obj.testcases.is_a?(Array) != false || raise("Passed value for field obj.testcases is not the expected type, validation failed.")
          obj.is_public.is_a?(Boolean) != false || raise("Passed value for field obj.is_public is not the expected type, validation failed.")
        end
      end
    end
  end
end
