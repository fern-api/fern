
module Seed
    module Types
        class User < Internal::Types::Model
            field :name, , optional: true, nullable: false
            field :tags, , optional: true, nullable: false
        end
    end
end
