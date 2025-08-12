
module Seed
    module Types
        class Person < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :address, Seed::level_1::types::Address, optional: false, nullable: false
        end
    end
end
