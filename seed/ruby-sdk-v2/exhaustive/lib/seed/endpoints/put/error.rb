
module Seed
    module Types
        class Error < Internal::Types::Model
            field :category, , optional: false, nullable: false
            field :code, , optional: false, nullable: false
            field :detail, , optional: true, nullable: false
            field :field, , optional: true, nullable: false
        end
    end
end
