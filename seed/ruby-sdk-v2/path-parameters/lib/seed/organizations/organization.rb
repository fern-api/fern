
module Seed
    module Types
        class Organization < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :tags, , optional: false, nullable: false
        end
    end
end
