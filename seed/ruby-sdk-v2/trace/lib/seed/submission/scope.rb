
module Seed
    module Types
        class Scope < Internal::Types::Model
            field :variables, Internal::Types::Hash[String, Seed::commons::DebugVariableValue], optional: false, nullable: false

    end
end
