# frozen_string_literal: true

require "json"

module SeedClient
  module Submission
    class GetTraceResponsesPageRequest
      attr_reader :offset, :additional_properties

      # @param offset [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::GetTraceResponsesPageRequest]
      def initialze(offset: nil, additional_properties: nil)
        # @type [Integer]
        @offset = offset
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of GetTraceResponsesPageRequest
      #
      # @param json_object [JSON]
      # @return [Submission::GetTraceResponsesPageRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        offset = struct.offset
        new(offset: offset, additional_properties: struct)
      end

      # Serialize an instance of GetTraceResponsesPageRequest to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          offset: @offset
        }.to_json
      end
    end
  end
end
