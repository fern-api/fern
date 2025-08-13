
module Seed
    module Types
        class StackFrame < Internal::Types::Model
            field :method_name, String, optional: false, nullable: false
            field :line_number, Integer, optional: false, nullable: false
            field :scopes, Internal::Types::Array[Seed::submission::Scope], optional: false, nullable: false

    end
end
