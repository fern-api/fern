# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class Tree < Internal::Types::Model
      field :nodes, -> { Internal::Types::Array[Seed::Types::Node] }, optional: true, nullable: false
    end
  end
end
