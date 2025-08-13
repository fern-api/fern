
module Seed
    module Types
        class WithCursor < Internal::Types::Model
            field :cursor, String, optional: true, nullable: false

    end
end
