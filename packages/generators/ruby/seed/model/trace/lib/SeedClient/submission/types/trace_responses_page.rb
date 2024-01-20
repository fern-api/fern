# frozen_string_literal: true

module SeedClient
  module Submission
    class TraceResponsesPage
      attr_reader :offset, :trace_responses, :additional_properties

      # @param offset [Integer] If present, use this to load subseqent pages. The offset is the id of the next trace response to load.
      # @param trace_responses [Array<Submission::TraceResponse>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TraceResponsesPage]
      def initialze(trace_responses:, offset: nil, additional_properties: nil)
        # @type [Integer]
        @offset = offset
        # @type [Array<Submission::TraceResponse>]
        @trace_responses = trace_responses
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TraceResponsesPage
      #
      # @param json_object [JSON]
      # @return [Submission::TraceResponsesPage]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        offset = struct.offset
        trace_responses = struct.traceResponses.map do |v|
          Submission::TraceResponse.from_json(json_object: v)
        end
        new(offset: offset, trace_responses: trace_responses, additional_properties: struct)
      end

      # Serialize an instance of TraceResponsesPage to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          offset: @offset,
          traceResponses: @trace_responses
        }.to_json
      end
    end
  end
end
