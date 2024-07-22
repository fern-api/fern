# frozen_string_literal: true

require_relative "test_case_result_with_stdout"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class TracedTestCase
      # @return [SeedTraceClient::Submission::TestCaseResultWithStdout]
      attr_reader :result
      # @return [Integer]
      attr_reader :trace_responses_size
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param result [SeedTraceClient::Submission::TestCaseResultWithStdout]
      # @param trace_responses_size [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::TracedTestCase]
      def initialize(result:, trace_responses_size:, additional_properties: nil)
        @result = result
        @trace_responses_size = trace_responses_size
        @additional_properties = additional_properties
        @_field_set = { "result": result, "traceResponsesSize": trace_responses_size }
      end

      # Deserialize a JSON object to an instance of TracedTestCase
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TracedTestCase]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["result"].nil?
          result = nil
        else
          result = parsed_json["result"].to_json
          result = SeedTraceClient::Submission::TestCaseResultWithStdout.from_json(json_object: result)
        end
        trace_responses_size = parsed_json["traceResponsesSize"]
        new(
          result: result,
          trace_responses_size: trace_responses_size,
          additional_properties: struct
        )
      end

      # Serialize an instance of TracedTestCase to a JSON object
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
        SeedTraceClient::Submission::TestCaseResultWithStdout.validate_raw(obj: obj.result)
        obj.trace_responses_size.is_a?(Integer) != false || raise("Passed value for field obj.trace_responses_size is not the expected type, validation failed.")
      end
    end
  end
end
