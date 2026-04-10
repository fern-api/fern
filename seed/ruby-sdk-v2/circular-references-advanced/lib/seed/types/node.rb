# frozen_string_literal: true

module Seed
  module Types
    class Node < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::BranchNode }
      member -> { Seed::Types::LeafNode }
    end
  end
end
