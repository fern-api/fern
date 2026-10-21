# frozen_string_literal: true

require_relative "../.."

module Seed
  module Types
    module Types
      class Tree < Internal::Types::Model
        field :nodes, -> { Internal::Types::Array[Seed::Types::Types::Node] }, optional: true, nullable: false
      end
    end
  end
end
