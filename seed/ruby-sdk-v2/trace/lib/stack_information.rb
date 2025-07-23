# frozen_string_literal: true

module Submission
    module Types
        class StackInformation < Internal::Types::Model
            field :num_stack_frames, Integer, optional: true, nullable: true
            field :top_stack_frame, Array, optional: true, nullable: true
        end
    end
end
