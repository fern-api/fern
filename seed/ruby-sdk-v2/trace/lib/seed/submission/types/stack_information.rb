# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class StackInformation < Internal::Types::Model
        field :num_stack_frames, -> { Integer }, optional: false, nullable: false, api_name: "numStackFrames"
        field :top_stack_frame, lambda {
          Seed::Submission::Types::StackFrame
        }, optional: true, nullable: false, api_name: "topStackFrame"
      end
    end
  end
end
