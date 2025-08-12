
module Seed
    module Types
        class ExpressionLocation < Internal::Types::Model
            field :start, , optional: false, nullable: false
            field :offset, , optional: false, nullable: false
        end
    end
end
