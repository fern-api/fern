# frozen_string_literal: true
require "submission/types/TestCaseResult"
require "json"

module SeedClient
  module Submission
    class TestCaseResultWithStdout
      attr_reader :result, :stdout, :additional_properties
      # @param result [Submission::TestCaseResult] 
      # @param stdout [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestCaseResultWithStdout] 
      def initialze(result:, stdout:, additional_properties: nil)
        # @type [Submission::TestCaseResult] 
        @result = result
        # @type [String] 
        @stdout = stdout
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of TestCaseResultWithStdout
      #
      # @param json_object [JSON] 
      # @return [Submission::TestCaseResultWithStdout] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        result = Submission::TestCaseResult.from_json(json_object: struct.result)
        stdout = struct.stdout
        new(result: result, stdout: stdout, additional_properties: struct)
      end
      # Serialize an instance of TestCaseResultWithStdout to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 result: @result,
 stdout: @stdout
}.to_json()
      end
    end
  end
end