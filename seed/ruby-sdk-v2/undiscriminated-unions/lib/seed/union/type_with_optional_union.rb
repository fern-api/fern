# frozen_string_literal: true

module Seed
    module Types
        class TypeWithOptionalUnion < Internal::Types::Model
            field :my_union, Seed::Union::MyUnion, optional: true, nullable: false

    end
end
