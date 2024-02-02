# frozen_string_literal: true

require_relative "non_void_function_signature"
require_relative "basic_test_case_template"
require "json"

module SeedTraceClient
  module V2
    module V3
      module Problem
        class BasicCustomFiles
          attr_reader :method_name, :signature, :additional_files, :basic_test_case_template, :additional_properties

          # @param method_name [String]
          # @param signature [V2::V3::Problem::NonVoidFunctionSignature]
          # @param additional_files [Hash{LANGUAGE => LANGUAGE}]
          # @param basic_test_case_template [V2::V3::Problem::BasicTestCaseTemplate]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::BasicCustomFiles]
          def initialize(method_name:, signature:, additional_files:, basic_test_case_template:,
                         additional_properties: nil)
            # @type [String]
            @method_name = method_name
            # @type [V2::V3::Problem::NonVoidFunctionSignature]
            @signature = signature
            # @type [Hash{LANGUAGE => LANGUAGE}]
            @additional_files = additional_files
            # @type [V2::V3::Problem::BasicTestCaseTemplate]
            @basic_test_case_template = basic_test_case_template
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of BasicCustomFiles
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::BasicCustomFiles]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            method_name = struct.methodName
            signature = struct.signature
            additional_files = struct.additionalFiles
            basic_test_case_template = struct.basicTestCaseTemplate
            new(method_name: method_name, signature: signature, additional_files: additional_files,
                basic_test_case_template: basic_test_case_template, additional_properties: struct)
          end

          # Serialize an instance of BasicCustomFiles to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            {
              "methodName": @method_name,
              "signature": @signature,
              "additionalFiles": @additional_files,
              "basicTestCaseTemplate": @basic_test_case_template
            }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            obj.method_name.is_a?(String) != false || raise("Passed value for field obj.method_name is not the expected type, validation failed.")
            V2::V3::Problem::NonVoidFunctionSignature.validate_raw(obj: obj.signature)
            obj.additional_files.is_a?(Hash) != false || raise("Passed value for field obj.additional_files is not the expected type, validation failed.")
            V2::V3::Problem::BasicTestCaseTemplate.validate_raw(obj: obj.basic_test_case_template)
          end
        end
      end
    end
  end
end
