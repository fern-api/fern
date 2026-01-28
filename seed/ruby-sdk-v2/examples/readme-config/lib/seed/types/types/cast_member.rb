# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class CastMember < Internal::Types::Model
        extend FernExamples::Internal::Types::Union

        member -> { FernExamples::Types::Types::Actor }
        member -> { FernExamples::Types::Types::Actress }
        member -> { FernExamples::Types::Types::StuntDouble }
      end
    end
  end
end
