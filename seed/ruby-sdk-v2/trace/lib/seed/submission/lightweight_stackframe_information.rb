
module Seed
    module Types
        class LightweightStackframeInformation < Internal::Types::Model
            field :num_stack_frames, , optional: false, nullable: false
            field :top_stack_frame_method_name, , optional: false, nullable: false
        end
    end
end
