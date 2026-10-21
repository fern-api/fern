# frozen_string_literal: true

require_relative "../.."

module Seed
  module Ast
    module Types
      class BranchNode < Internal::Types::Model
        field :children, -> { Internal::Types::Array[Seed::Ast::Types::Node] }, optional: false, nullable: false
      end
    end
  end
end
