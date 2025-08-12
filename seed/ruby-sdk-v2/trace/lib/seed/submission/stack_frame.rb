
module Seed
    module Types
        class StackFrame < Internal::Types::Model
            field :method_name, , optional: false, nullable: false
            field :line_number, , optional: false, nullable: false
            field :scopes, , optional: false, nullable: false
        end
    end
end
