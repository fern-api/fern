
module Seed
    module Types
        class User < Internal::Types::Model
            field :name, , optional: false, nullable: false
        end
    end
end
