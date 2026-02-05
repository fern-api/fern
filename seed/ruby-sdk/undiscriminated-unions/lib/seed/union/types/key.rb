# frozen_string_literal: true

module Seed
  module Union
    module Types
      class Key < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Union::Types::KeyType }
        member -> { String }
      end
    end
  end
end
