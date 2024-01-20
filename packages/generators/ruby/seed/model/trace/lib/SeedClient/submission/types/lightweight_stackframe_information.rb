# frozen_string_literal: true

module SeedClient
  module Submission
    class LightweightStackframeInformation
      attr_reader :num_stack_frames, :top_stack_frame_method_name, :additional_properties

      # @param num_stack_frames [Integer]
      # @param top_stack_frame_method_name [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::LightweightStackframeInformation]
      def initialze(num_stack_frames:, top_stack_frame_method_name:, additional_properties: nil)
        # @type [Integer]
        @num_stack_frames = num_stack_frames
        # @type [String]
        @top_stack_frame_method_name = top_stack_frame_method_name
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of LightweightStackframeInformation
      #
      # @param json_object [JSON]
      # @return [Submission::LightweightStackframeInformation]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        num_stack_frames = struct.numStackFrames
        top_stack_frame_method_name = struct.topStackFrameMethodName
        new(num_stack_frames: num_stack_frames, top_stack_frame_method_name: top_stack_frame_method_name,
            additional_properties: struct)
      end

      # Serialize an instance of LightweightStackframeInformation to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          numStackFrames: @num_stack_frames,
          topStackFrameMethodName: @top_stack_frame_method_name
        }.to_json
      end
    end
  end
end
