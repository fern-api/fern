# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class LightweightStackframeInformation
      # @return [Integer]
      attr_reader :num_stack_frames
      # @return [String]
      attr_reader :top_stack_frame_method_name
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param num_stack_frames [Integer]
      # @param top_stack_frame_method_name [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::LightweightStackframeInformation]
      def initialize(num_stack_frames:, top_stack_frame_method_name:, additional_properties: nil)
        @num_stack_frames = num_stack_frames
        @top_stack_frame_method_name = top_stack_frame_method_name
        @additional_properties = additional_properties
        @_field_set = { "numStackFrames": num_stack_frames, "topStackFrameMethodName": top_stack_frame_method_name }
      end

      # Deserialize a JSON object to an instance of LightweightStackframeInformation
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::LightweightStackframeInformation]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        num_stack_frames = parsed_json["numStackFrames"]
        top_stack_frame_method_name = parsed_json["topStackFrameMethodName"]
        new(
          num_stack_frames: num_stack_frames,
          top_stack_frame_method_name: top_stack_frame_method_name,
          additional_properties: struct
        )
      end

      # Serialize an instance of LightweightStackframeInformation to a JSON object
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
        obj.num_stack_frames.is_a?(Integer) != false || raise("Passed value for field obj.num_stack_frames is not the expected type, validation failed.")
        obj.top_stack_frame_method_name.is_a?(String) != false || raise("Passed value for field obj.top_stack_frame_method_name is not the expected type, validation failed.")
      end
    end
  end
end
