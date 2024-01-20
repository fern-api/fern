# frozen_string_literal: true

module SeedClient
  module Submission
    class StackInformation
      attr_reader :num_stack_frames, :top_stack_frame, :additional_properties
      # @param num_stack_frames [Integer] 
      # @param top_stack_frame [Submission::StackFrame] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::StackInformation] 
      def initialze(num_stack_frames:, top_stack_frame: nil, additional_properties: nil)
        # @type [Integer] 
        @num_stack_frames = num_stack_frames
        # @type [Submission::StackFrame] 
        @top_stack_frame = top_stack_frame
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of StackInformation
      #
      # @param json_object [JSON] 
      # @return [Submission::StackInformation] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        num_stack_frames = struct.numStackFrames
        top_stack_frame = Submission::StackFrame.from_json(json_object: struct.topStackFrame)
        new(num_stack_frames: num_stack_frames, top_stack_frame: top_stack_frame, additional_properties: struct)
      end
      # Serialize an instance of StackInformation to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 numStackFrames: @num_stack_frames,
 topStackFrame: @top_stack_frame
}.to_json()
      end
    end
  end
end