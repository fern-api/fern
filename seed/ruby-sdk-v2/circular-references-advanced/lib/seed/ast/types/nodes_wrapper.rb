# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class NodesWrapper < Internal::Types::Model
        field :nodes, lambda {
          Internal::Types::Array[Internal::Types::Array[Seed::Ast::Types::Node]]
        }, optional: false, nullable: false
      end
    end
  end
end
