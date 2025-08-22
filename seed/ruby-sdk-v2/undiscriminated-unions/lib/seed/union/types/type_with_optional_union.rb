# frozen_string_literal: true

module Seed
  module Union
    module Types
      class TypeWithOptionalUnion < Internal::Types::Model
        field :my_union, -> { Seed::Union::Types::MyUnion }, optional: true, nullable: false
      end
    end
  end
end
