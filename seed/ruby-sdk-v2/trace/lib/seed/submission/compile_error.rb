
module Seed
    module Types
        class CompileError < Internal::Types::Model
            field :message, , optional: false, nullable: false
        end
    end
end
