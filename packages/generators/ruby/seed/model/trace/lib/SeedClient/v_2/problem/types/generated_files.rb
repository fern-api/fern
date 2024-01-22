# frozen_string_literal: true
require "json"

module SeedClient
  module V2
    module Problem
      class GeneratedFiles
        attr_reader :generated_test_case_files, :generated_template_files, :other, :additional_properties
        # @param generated_test_case_files [Hash{LANGUAGE => LANGUAGE}] 
        # @param generated_template_files [Hash{LANGUAGE => LANGUAGE}] 
        # @param other [Hash{LANGUAGE => LANGUAGE}] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::GeneratedFiles]
        def initialze(generated_test_case_files:, generated_template_files:, other:, additional_properties: nil)
          # @type [Hash{LANGUAGE => LANGUAGE}] 
          @generated_test_case_files = generated_test_case_files
          # @type [Hash{LANGUAGE => LANGUAGE}] 
          @generated_template_files = generated_template_files
          # @type [Hash{LANGUAGE => LANGUAGE}] 
          @other = other
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of GeneratedFiles
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::GeneratedFiles]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          generated_test_case_files = struct.generatedTestCaseFiles.transform_values() do | v |
  LANGUAGE.key(v)
end
          generated_template_files = struct.generatedTemplateFiles.transform_values() do | v |
  LANGUAGE.key(v)
end
          other = struct.other.transform_values() do | v |
  LANGUAGE.key(v)
end
          new(generated_test_case_files: generated_test_case_files, generated_template_files: generated_template_files, other: other, additional_properties: struct)
        end
        # Serialize an instance of GeneratedFiles to a JSON object
        #
        # @return [JSON]
        def to_json
          { generatedTestCaseFiles: @generated_test_case_files.transform_values() do | v |
  LANGUAGE.key(v)
end, generatedTemplateFiles: @generated_template_files.transform_values() do | v |
  LANGUAGE.key(v)
end, other: @other.transform_values() do | v |
  LANGUAGE.key(v)
end }.to_json()
        end
        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object] 
        # @return [Void]
        def self.validate_raw(obj:)
          obj.generated_test_case_files.is_a?(Hash) != false || raise("Passed value for field obj.generated_test_case_files is not the expected type, validation failed.")
          obj.generated_template_files.is_a?(Hash) != false || raise("Passed value for field obj.generated_template_files is not the expected type, validation failed.")
          obj.other.is_a?(Hash) != false || raise("Passed value for field obj.other is not the expected type, validation failed.")
        end
      end
    end
  end
end