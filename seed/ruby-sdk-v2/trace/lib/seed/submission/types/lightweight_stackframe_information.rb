# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class LightweightStackframeInformation < Internal::Types::Model
        field :num_stack_frames, -> { Integer }, optional: false, nullable: false
        field :top_stack_frame_method_name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
