
module Seed
    module Types
        class WithCursor < Internal::Types::Model
            field :cursor, , optional: true, nullable: false
        end
    end
end
