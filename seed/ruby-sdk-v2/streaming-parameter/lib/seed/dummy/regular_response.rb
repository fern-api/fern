
module Seed
    module Types
        class RegularResponse < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :name, , optional: true, nullable: false
        end
    end
end
