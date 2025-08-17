# frozen_string_literal: true

module Seed
  module Endpoints
    module Put
      module Types
        class PutResponse < Internal::Types::Model
          field :errors, Internal::Types::Array[Seed::Endpoints::Put::Types::Error], optional: true, nullable: false

        end
      end
    end
  end
end
