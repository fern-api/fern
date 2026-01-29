# frozen_string_literal: true

module Seed
  module Types
    class UnionListResponse < Internal::Types::Model
      field :data, -> { Internal::Types::Array[Seed::Types::MyUnion] }, optional: false, nullable: false
    end
  end
end
