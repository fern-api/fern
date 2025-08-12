
module Seed
    module Types
        class User < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :id, , optional: false, nullable: false
            field :tags, , optional: false, nullable: true
            field :metadata, , optional: true, nullable: false
            field :email, , optional: false, nullable: false
            field :favorite_number, , optional: false, nullable: false
            field :numbers, , optional: true, nullable: false
            field :strings, , optional: true, nullable: false
        end
    end
end
