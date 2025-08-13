
module Seed
    module Types
        class Dog < Internal::Types::Model
            field :fruit, Seed::ast::Fruit, optional: false, nullable: false

    end
end
