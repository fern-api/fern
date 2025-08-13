
module Seed
    module Types
        class VoidFunctionSignature < Internal::Types::Model
            field :parameters, Internal::Types::Array[Seed::v_2::problem::Parameter], optional: false, nullable: false

    end
end
