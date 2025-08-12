
module Seed
    module Types
        class StackInformation < Internal::Types::Model
            field :num_stack_frames, , optional: false, nullable: false
            field :top_stack_frame, , optional: true, nullable: false
        end
    end
end
