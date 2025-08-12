
module Seed
    module Types
        class Organization < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :users, , optional: false, nullable: false
        end
    end
end
