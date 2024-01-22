# frozen_string_literal: true

require_relative "submission/types/StackFrame"
require "json"

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
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of StackInformation
      #
      # @param json_object [JSON]
      # @return [Submission::StackInformation]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        num_stack_frames struct.numStackFrames
        top_stack_frame Submission::StackFrame.from_json(json_object: struct.topStackFrame)
        new(num_stack_frames: num_stack_frames, top_stack_frame: top_stack_frame, additional_properties: struct)
      end

      # Serialize an instance of StackInformation to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { numStackFrames: @num_stack_frames, topStackFrame: @top_stack_frame }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.num_stack_frames.is_a?(Integer) != false || raise("Passed value for field obj.num_stack_frames is not the expected type, validation failed.")
        obj.top_stack_frame.nil? || StackFrame.validate_raw(obj: obj.top_stack_frame)
      end
    end
  end
end
