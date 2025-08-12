
module Seed
    module Types
        class Person < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :address, , optional: false, nullable: false
        end
    end
end
