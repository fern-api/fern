# frozen_string_literal: true

require_relative "../../../seed"

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
