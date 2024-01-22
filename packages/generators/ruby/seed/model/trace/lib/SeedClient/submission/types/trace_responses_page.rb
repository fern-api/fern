# frozen_string_literal: true
require "submission/types/TraceResponse"
require "json"

module SeedClient
  module Submission
    class TraceResponsesPage
      attr_reader :offset, :trace_responses, :additional_properties
      # @param offset [Integer] If present, use this to load subseqent pages. The offset is the id of the next trace response to load.
      # @param trace_responses [Array<Submission::TraceResponse>] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TraceResponsesPage] 
      def initialze(offset: nil, trace_responses:, additional_properties: nil)
        # @type [Integer] If present, use this to load subseqent pages. The offset is the id of the next trace response to load.
        @offset = offset
        # @type [Array<Submission::TraceResponse>] 
        @trace_responses = trace_responses
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of TraceResponsesPage
      #
      # @param json_object [JSON] 
      # @return [Submission::TraceResponsesPage] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        offset struct.offset
        trace_responses struct.traceResponses.map() do | v |
  Submission::TraceResponse.from_json(json_object: v)
end
        new(offset: offset, trace_responses: trace_responses, additional_properties: struct)
      end
      # Serialize an instance of TraceResponsesPage to a JSON object
      #
      # @return [JSON] 
      def to_json
        { offset: @offset, traceResponses: @trace_responses }.to_json()
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