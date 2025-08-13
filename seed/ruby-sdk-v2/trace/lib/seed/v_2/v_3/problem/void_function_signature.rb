# frozen_string_literal: true

module Seed
    module Types
        class VoidFunctionSignature < Internal::Types::Model
            field :parameters, Internal::Types::Array[Seed::V2::V3::Problem::Parameter], optional: false, nullable: false

    end
end
