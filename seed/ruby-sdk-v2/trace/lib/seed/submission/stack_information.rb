# frozen_string_literal: true

module Seed
    module Types
        class StackInformation < Internal::Types::Model
            field :num_stack_frames, Integer, optional: false, nullable: false
            field :top_stack_frame, Seed::Submission::StackFrame, optional: true, nullable: false

    end
end
