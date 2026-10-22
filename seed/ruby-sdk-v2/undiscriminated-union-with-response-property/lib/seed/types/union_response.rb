# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class UnionResponse < Internal::Types::Model
      field :data, -> { Seed::Types::MyUnion }, optional: false, nullable: false
    end
  end
end
