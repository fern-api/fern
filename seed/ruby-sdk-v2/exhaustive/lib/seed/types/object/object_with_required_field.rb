
module Seed
    module Types
        class ObjectWithRequiredField < Internal::Types::Model
            field :string, String, optional: true, nullable: true
        end
    end
end
