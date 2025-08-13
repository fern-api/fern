
module Seed
    module Types
        class Berry < Internal::Types::Model
            field :animal, Seed::ast::Animal, optional: false, nullable: false
        end
    end
end
