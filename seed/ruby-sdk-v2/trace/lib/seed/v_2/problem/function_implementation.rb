
module Seed
    module Types
        class FunctionImplementation < Internal::Types::Model
            field :impl, , optional: false, nullable: false
            field :imports, , optional: true, nullable: false
        end
    end
end
