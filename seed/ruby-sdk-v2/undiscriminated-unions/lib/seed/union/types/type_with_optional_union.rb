# frozen_string_literal: true

module Seed
  module Union
    module Types
      class TypeWithOptionalUnion < Internal::Types::Model
        field :my_union, -> { Seed::Union::Types::MyUnion }, optional: true, nullable: false, api_name: "myUnion"
      end
    end
  end
end
