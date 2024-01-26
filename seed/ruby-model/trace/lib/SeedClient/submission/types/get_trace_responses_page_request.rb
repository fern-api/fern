# frozen_string_literal: true

require "json"

module SeedClient
  module Submission
    class GetTraceResponsesPageRequest
      attr_reader :offset, :additional_properties

      # @param offset [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::GetTraceResponsesPageRequest]
      def initialize(offset: nil, additional_properties: nil)
        # @type [Integer]
        @offset = offset
        # @type [OpenStruct] Additional properties unmapped to the current class definition
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
        { "offset": @offset }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.offset&.is_a?(Integer) != false || raise("Passed value for field obj.offset is not the expected type, validation failed.")
      end
    end
  end
end
