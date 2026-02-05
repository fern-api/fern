# frozen_string_literal: true

module Seed
  module Ast
    module Types
      class Node < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Ast::Types::BranchNode }
        member -> { Seed::Ast::Types::LeafNode }
      end
    end
  end
end
