# frozen_string_literal: true

require_relative "trace_response_v_2"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class TraceResponsesPageV2
      # @return [Integer] If present, use this to load subsequent pages.
      #  The offset is the id of the next trace response to load.
      attr_reader :offset
      # @return [Array<SeedTraceClient::Submission::TraceResponseV2>]
      attr_reader :trace_responses
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param offset [Integer] If present, use this to load subsequent pages.
      #  The offset is the id of the next trace response to load.
      # @param trace_responses [Array<SeedTraceClient::Submission::TraceResponseV2>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::TraceResponsesPageV2]
      def initialize(trace_responses:, offset: OMIT, additional_properties: nil)
        @offset = offset if offset != OMIT
        @trace_responses = trace_responses
        @additional_properties = additional_properties
        @_field_set = { "offset": offset, "traceResponses": trace_responses }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of TraceResponsesPageV2
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TraceResponsesPageV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        offset = parsed_json["offset"]
        trace_responses = parsed_json["traceResponses"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Submission::TraceResponseV2.from_json(json_object: item)
        end
        new(
          offset: offset,
          trace_responses: trace_responses,
          additional_properties: struct
        )
      end

      # Serialize an instance of TraceResponsesPageV2 to a JSON object
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
        obj.offset&.is_a?(Integer) != false || raise("Passed value for field obj.offset is not the expected type, validation failed.")
        obj.trace_responses.is_a?(Array) != false || raise("Passed value for field obj.trace_responses is not the expected type, validation failed.")
      end
    end
  end
end
