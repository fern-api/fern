
module Seed
    module Types
        class Actor < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :id, , optional: false, nullable: false
        end
    end
end
