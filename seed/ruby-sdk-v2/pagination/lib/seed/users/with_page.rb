
module Seed
    module Types
        class WithPage < Internal::Types::Model
            field :page, Integer, optional: true, nullable: false
        end
    end
end
