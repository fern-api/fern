# frozen_string_literal: true

require_relative "non_void_function_signature"
require_relative "basic_test_case_template"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class BasicCustomFiles
          # @return [String]
          attr_reader :method_name
          # @return [SeedTraceClient::V2::V3::Problem::NonVoidFunctionSignature]
          attr_reader :signature
          # @return [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::V2::V3::Problem::Files}]
          attr_reader :additional_files
          # @return [SeedTraceClient::V2::V3::Problem::BasicTestCaseTemplate]
          attr_reader :basic_test_case_template
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param method_name [String]
          # @param signature [SeedTraceClient::V2::V3::Problem::NonVoidFunctionSignature]
          # @param additional_files [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::V2::V3::Problem::Files}]
          # @param basic_test_case_template [SeedTraceClient::V2::V3::Problem::BasicTestCaseTemplate]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::BasicCustomFiles]
          def initialize(method_name:, signature:, additional_files:, basic_test_case_template:,
                         additional_properties: nil)
            @method_name = method_name
            @signature = signature
            @additional_files = additional_files
            @basic_test_case_template = basic_test_case_template
            @additional_properties = additional_properties
            @_field_set = {
              "methodName": method_name,
              "signature": signature,
              "additionalFiles": additional_files,
              "basicTestCaseTemplate": basic_test_case_template
            }
          end

          # Deserialize a JSON object to an instance of BasicCustomFiles
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::BasicCustomFiles]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            method_name = parsed_json["methodName"]
            if parsed_json["signature"].nil?
              signature = nil
            else
              signature = parsed_json["signature"].to_json
              signature = SeedTraceClient::V2::V3::Problem::NonVoidFunctionSignature.from_json(json_object: signature)
            end
            additional_files = parsed_json["additionalFiles"]&.transform_values do |value|
              value = value.to_json
              SeedTraceClient::V2::V3::Problem::Files.from_json(json_object: value)
            end
            if parsed_json["basicTestCaseTemplate"].nil?
              basic_test_case_template = nil
            else
              basic_test_case_template = parsed_json["basicTestCaseTemplate"].to_json
              basic_test_case_template = SeedTraceClient::V2::V3::Problem::BasicTestCaseTemplate.from_json(json_object: basic_test_case_template)
            end
            new(
              method_name: method_name,
              signature: signature,
              additional_files: additional_files,
              basic_test_case_template: basic_test_case_template,
              additional_properties: struct
            )
          end

          # Serialize an instance of BasicCustomFiles to a JSON object
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
            obj.method_name.is_a?(String) != false || raise("Passed value for field obj.method_name is not the expected type, validation failed.")
            SeedTraceClient::V2::V3::Problem::NonVoidFunctionSignature.validate_raw(obj: obj.signature)
            obj.additional_files.is_a?(Hash) != false || raise("Passed value for field obj.additional_files is not the expected type, validation failed.")
            SeedTraceClient::V2::V3::Problem::BasicTestCaseTemplate.validate_raw(obj: obj.basic_test_case_template)
          end
        end
      end
    end
  end
end
