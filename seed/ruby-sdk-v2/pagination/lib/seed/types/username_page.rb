
module Seed
    module Types
        class UsernamePage < Internal::Types::Model
            field :after, , optional: true, nullable: false
            field :data, , optional: false, nullable: false
        end
    end
end
