# frozen_string_literal: true

module SeedClient
  module Submission
    class ExpressionLocation
      attr_reader :start, :offset, :additional_properties
      # @param start [Integer] 
      # @param offset [Integer] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::ExpressionLocation] 
      def initialze(start:, offset:, additional_properties: nil)
        # @type [Integer] 
        @start = start
        # @type [Integer] 
        @offset = offset
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of ExpressionLocation
      #
      # @param json_object [JSON] 
      # @return [Submission::ExpressionLocation] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        start = struct.start
        offset = struct.offset
        new(start: start, offset: offset, additional_properties: struct)
      end
      # Serialize an instance of ExpressionLocation to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 start: @start,
 offset: @offset
}.to_json()
      end
    end
  end
end