
module Seed
    module Types
        class Fig < Internal::Types::Model
            field :animal, Seed::ast::Animal, optional: false, nullable: false

    end
end
