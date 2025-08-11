# frozen_string_literal: true

module Submission
    module Types
        class LightweightStackframeInformation < Internal::Types::Model
            field :num_stack_frames, Integer, optional: true, nullable: true
            field :top_stack_frame_method_name, String, optional: true, nullable: true
        end
    end
end
