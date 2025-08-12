
module Seed
    module Types
        class RuntimeError < Internal::Types::Model
            field :message, , optional: false, nullable: false
        end
    end
end
