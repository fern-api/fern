
module Seed
    module Types
        class TestCase < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :params, , optional: false, nullable: false
        end
    end
end
