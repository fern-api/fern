
module Seed
    module Types
        class TestCase < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :params, Internal::Types::Array[Seed::commons::VariableValue], optional: false, nullable: false

    end
end
