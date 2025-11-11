# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class LightweightStackframeInformation < Internal::Types::Model
        field :num_stack_frames, -> { Integer }, optional: false, nullable: false, api_name: "numStackFrames"
        field :top_stack_frame_method_name, lambda {
          String
        }, optional: false, nullable: false, api_name: "topStackFrameMethodName"
      end
    end
  end
end
