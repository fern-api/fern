
module Seed
    module Types
        class StderrResponse < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :stderr, String, optional: false, nullable: false

    end
end
