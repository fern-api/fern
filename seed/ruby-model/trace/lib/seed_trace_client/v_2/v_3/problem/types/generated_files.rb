# frozen_string_literal: true

require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class GeneratedFiles
          attr_reader :generated_test_case_files, :generated_template_files, :other, :additional_properties

          # @param generated_test_case_files [Hash{Commons::Language => Commons::Language}]
          # @param generated_template_files [Hash{Commons::Language => Commons::Language}]
          # @param other [Hash{Commons::Language => Commons::Language}]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::GeneratedFiles]
          def initialize(generated_test_case_files:, generated_template_files:, other:, additional_properties: nil)
            # @type [Hash{Commons::Language => Commons::Language}]
            @generated_test_case_files = generated_test_case_files
            # @type [Hash{Commons::Language => Commons::Language}]
            @generated_template_files = generated_template_files
            # @type [Hash{Commons::Language => Commons::Language}]
            @other = other
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of GeneratedFiles
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::GeneratedFiles]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            JSON.parse(json_object)
            generated_test_case_files = struct.generatedTestCaseFiles
            generated_template_files = struct.generatedTemplateFiles
            other = struct.other
            new(generated_test_case_files: generated_test_case_files,
                generated_template_files: generated_template_files, other: other, additional_properties: struct)
          end

          # Serialize an instance of GeneratedFiles to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            {
              "generatedTestCaseFiles": @generated_test_case_files,
              "generatedTemplateFiles": @generated_template_files,
              "other": @other
            }.to_json
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
end
