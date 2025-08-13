
module Seed
    module Types
        class Actress < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :id, String, optional: false, nullable: false
        end
    end
end
