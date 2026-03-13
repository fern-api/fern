# frozen_string_literal: true

module Seed
  module Types
    module Types
      class CastMember < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Seed::Types::Types::Actor }
        member -> { Seed::Types::Types::Actress }
        member -> { Seed::Types::Types::StuntDouble }
      end
    end
  end
end
