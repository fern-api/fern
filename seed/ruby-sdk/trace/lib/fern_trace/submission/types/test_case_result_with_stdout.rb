# frozen_string_literal: true

require_relative "test_case_result"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class TestCaseResultWithStdout
      # @return [SeedTraceClient::Submission::TestCaseResult]
      attr_reader :result
      # @return [String]
      attr_reader :stdout
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param result [SeedTraceClient::Submission::TestCaseResult]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::TestCaseResultWithStdout]
      def initialize(result:, stdout:, additional_properties: nil)
        @result = result
        @stdout = stdout
        @additional_properties = additional_properties
        @_field_set = { "result": result, "stdout": stdout }
      end

      # Deserialize a JSON object to an instance of TestCaseResultWithStdout
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TestCaseResultWithStdout]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["result"].nil?
          result = nil
        else
          result = parsed_json["result"].to_json
          result = SeedTraceClient::Submission::TestCaseResult.from_json(json_object: result)
        end
        stdout = parsed_json["stdout"]
        new(
          result: result,
          stdout: stdout,
          additional_properties: struct
        )
      end

      # Serialize an instance of TestCaseResultWithStdout to a JSON object
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
        SeedTraceClient::Submission::TestCaseResult.validate_raw(obj: obj.result)
        obj.stdout.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end
