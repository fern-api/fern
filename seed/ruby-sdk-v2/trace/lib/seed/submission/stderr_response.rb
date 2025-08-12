
module Seed
    module Types
        class StderrResponse < Internal::Types::Model
            field :submission_id, , optional: false, nullable: false
            field :stderr, , optional: false, nullable: false
        end
    end
end
