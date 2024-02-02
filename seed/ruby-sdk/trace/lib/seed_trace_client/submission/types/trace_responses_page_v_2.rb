# frozen_string_literal: true

require_relative "trace_response_v_2"
require "json"

module SeedTraceClient
  module Submission
    class TraceResponsesPageV2
      attr_reader :offset, :trace_responses, :additional_properties

      # @param offset [Integer] If present, use this to load subseqent pages. The offset is the id of the next trace response to load.
      # @param trace_responses [Array<Submission::TraceResponseV2>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TraceResponsesPageV2]
      def initialize(trace_responses:, offset: nil, additional_properties: nil)
        # @type [Integer] If present, use this to load subseqent pages. The offset is the id of the next trace response to load.
        @offset = offset
        # @type [Array<Submission::TraceResponseV2>]
        @trace_responses = trace_responses
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TraceResponsesPageV2
      #
      # @param json_object [JSON]
      # @return [Submission::TraceResponsesPageV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        offset = struct.offset
        trace_responses = struct.traceResponses
        new(offset: offset, trace_responses: trace_responses, additional_properties: struct)
      end

      # Serialize an instance of TraceResponsesPageV2 to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "offset": @offset, "traceResponses": @trace_responses }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.offset&.is_a?(Integer) != false || raise("Passed value for field obj.offset is not the expected type, validation failed.")
        obj.trace_responses.is_a?(Array) != false || raise("Passed value for field obj.trace_responses is not the expected type, validation failed.")
      end
    end
  end
end
