# frozen_string_literal: true

require_relative "test_case_result"
require "json"

module SeedTraceClient
  module Submission
    class TestCaseResultWithStdout
      attr_reader :result, :stdout, :additional_properties

      # @param result [Submission::TestCaseResult]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestCaseResultWithStdout]
      def initialize(result:, stdout:, additional_properties: nil)
        # @type [Submission::TestCaseResult]
        @result = result
        # @type [String]
        @stdout = stdout
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestCaseResultWithStdout
      #
      # @param json_object [JSON]
      # @return [Submission::TestCaseResultWithStdout]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        result = struct.result
        stdout = struct.stdout
        new(result: result, stdout: stdout, additional_properties: struct)
      end

      # Serialize an instance of TestCaseResultWithStdout to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "result": @result, "stdout": @stdout }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Submission::TestCaseResult.validate_raw(obj: obj.result)
        obj.stdout.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end
