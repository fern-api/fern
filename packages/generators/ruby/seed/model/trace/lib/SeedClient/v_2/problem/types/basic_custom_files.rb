# frozen_string_literal: true
require_relative "v_2/problem/types/NonVoidFunctionSignature"
require_relative "v_2/problem/types/BasicTestCaseTemplate"
require "json"

module SeedClient
  module V2
    module Problem
      class BasicCustomFiles
        attr_reader :method_name, :signature, :additional_files, :basic_test_case_template, :additional_properties
        # @param method_name [String] 
        # @param signature [V2::Problem::NonVoidFunctionSignature] 
        # @param additional_files [Hash{Commons::Language => Commons::Language}] 
        # @param basic_test_case_template [V2::Problem::BasicTestCaseTemplate] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::BasicCustomFiles] 
        def initialze(method_name:, signature:, additional_files:, basic_test_case_template:, additional_properties: nil)
          # @type [String] 
          @method_name = method_name
          # @type [V2::Problem::NonVoidFunctionSignature] 
          @signature = signature
          # @type [Hash{Commons::Language => Commons::Language}] 
          @additional_files = additional_files
          # @type [V2::Problem::BasicTestCaseTemplate] 
          @basic_test_case_template = basic_test_case_template
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of BasicCustomFiles
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::BasicCustomFiles] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          method_name = struct.methodName
          signature = V2::Problem::NonVoidFunctionSignature.from_json(json_object: struct.signature)
          additional_files = struct.additionalFiles.transform_values() do | v |
 Commons::Language.from_json(json_object: v)
end
          basic_test_case_template = V2::Problem::BasicTestCaseTemplate.from_json(json_object: struct.basicTestCaseTemplate)
          new(method_name: method_name, signature: signature, additional_files: additional_files, basic_test_case_template: basic_test_case_template, additional_properties: struct)
        end
        # Serialize an instance of BasicCustomFiles to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 methodName: @method_name,
 signature: @signature,
 additionalFiles: @additional_files.transform_values() do | v |\n Commons::Language.from_json(json_object: v)\nend,
 basicTestCaseTemplate: @basic_test_case_template
}.to_json()
        end
      end
    end
  end
end