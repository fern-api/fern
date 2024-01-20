# frozen_string_literal: true

module SeedClient
  module V2
    module V3
      module Problem
        class GeneratedFiles
          attr_reader :generated_test_case_files, :generated_template_files, :other, :additional_properties
          # @param generated_test_case_files [Hash{Commons::Language => Commons::Language}] 
          # @param generated_template_files [Hash{Commons::Language => Commons::Language}] 
          # @param other [Hash{Commons::Language => Commons::Language}] 
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::GeneratedFiles] 
          def initialze(generated_test_case_files:, generated_template_files:, other:, additional_properties: nil)
            # @type [Hash{Commons::Language => Commons::Language}] 
            @generated_test_case_files = generated_test_case_files
            # @type [Hash{Commons::Language => Commons::Language}] 
            @generated_template_files = generated_template_files
            # @type [Hash{Commons::Language => Commons::Language}] 
            @other = other
            # @type [OpenStruct] 
            @additional_properties = additional_properties
          end
          # Deserialize a JSON object to an instance of GeneratedFiles
          #
          # @param json_object [JSON] 
          # @return [V2::V3::Problem::GeneratedFiles] 
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            generated_test_case_files = struct.generatedTestCaseFiles.transform_values() do | v |
 Commons::Language.from_json(json_object: v)
end
            generated_template_files = struct.generatedTemplateFiles.transform_values() do | v |
 Commons::Language.from_json(json_object: v)
end
            other = struct.other.transform_values() do | v |
 Commons::Language.from_json(json_object: v)
end
            new(generated_test_case_files: generated_test_case_files, generated_template_files: generated_template_files, other: other, additional_properties: struct)
          end
          # Serialize an instance of GeneratedFiles to a JSON object
          #
          # @return [JSON] 
          def to_json
            {
 generatedTestCaseFiles: @generated_test_case_files.transform_values() do | v |\n Commons::Language.from_json(json_object: v)\nend,
 generatedTemplateFiles: @generated_template_files.transform_values() do | v |\n Commons::Language.from_json(json_object: v)\nend,
 other: @other.transform_values() do | v |\n Commons::Language.from_json(json_object: v)\nend
}.to_json()
          end
        end
      end
    end
  end
end