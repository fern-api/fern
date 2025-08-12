
module Seed
    module Types
        class ObjectWithRequiredField < Internal::Types::Model
            field :string, , optional: false, nullable: false
        end
    end
end
