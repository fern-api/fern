# frozen_string_literal: true

module Seed
  module Types
    class TypeWithOptionalUnion < Internal::Types::Model
      field :my_union, -> { Seed::Types::MyUnion }, optional: true, nullable: false, api_name: "myUnion"
    end
  end
end
