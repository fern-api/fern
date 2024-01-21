# frozen_string_literal: true
require "submission/types/TraceResponseV2"
require "json"

module SeedClient
  module Submission
    class TraceResponsesPageV2
      attr_reader :offset, :trace_responses, :additional_properties
      # @param offset [Integer] If present, use this to load subseqent pages. The offset is the id of the next trace response to load.
      # @param trace_responses [Array<Submission::TraceResponseV2>] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TraceResponsesPageV2] 
      def initialze(offset: nil, trace_responses:, additional_properties: nil)
        # @type [Integer] 
        @offset = offset
        # @type [Array<Submission::TraceResponseV2>] 
        @trace_responses = trace_responses
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of TraceResponsesPageV2
      #
      # @param json_object [JSON] 
      # @return [Submission::TraceResponsesPageV2] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        offset = struct.offset
        trace_responses = struct.traceResponses.map() do | v |
 Submission::TraceResponseV2.from_json(json_object: v)
end
        new(offset: offset, trace_responses: trace_responses, additional_properties: struct)
      end
      # Serialize an instance of TraceResponsesPageV2 to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 offset: @offset,
 traceResponses: @trace_responses
}.to_json()
      end
    end
  end
end