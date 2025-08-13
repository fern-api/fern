
module Seed
    module Types
        class Cat < Internal::Types::Model
            field :fruit, Seed::ast::Fruit, optional: false, nullable: false

    end
end
