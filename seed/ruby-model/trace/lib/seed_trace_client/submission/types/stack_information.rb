# frozen_string_literal: true

require_relative "stack_frame"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class StackInformation
      # @return [Integer]
      attr_reader :num_stack_frames
      # @return [SeedTraceClient::Submission::StackFrame]
      attr_reader :top_stack_frame
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param num_stack_frames [Integer]
      # @param top_stack_frame [SeedTraceClient::Submission::StackFrame]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::StackInformation]
      def initialize(num_stack_frames:, top_stack_frame: OMIT, additional_properties: nil)
        @num_stack_frames = num_stack_frames
        @top_stack_frame = top_stack_frame if top_stack_frame != OMIT
        @additional_properties = additional_properties
        @_field_set = { "numStackFrames": num_stack_frames, "topStackFrame": top_stack_frame }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of StackInformation
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::StackInformation]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        num_stack_frames = parsed_json["numStackFrames"]
        if parsed_json["topStackFrame"].nil?
          top_stack_frame = nil
        else
          top_stack_frame = parsed_json["topStackFrame"].to_json
          top_stack_frame = SeedTraceClient::Submission::StackFrame.from_json(json_object: top_stack_frame)
        end
        new(
          num_stack_frames: num_stack_frames,
          top_stack_frame: top_stack_frame,
          additional_properties: struct
        )
      end

      # Serialize an instance of StackInformation to a JSON object
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
        obj.top_stack_frame.nil? || SeedTraceClient::Submission::StackFrame.validate_raw(obj: obj.top_stack_frame)
      end
    end
  end
end
