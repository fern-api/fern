# frozen_string_literal: true

module FernExhaustive
  module Endpoints
    module Put
      module Types
        class PutResponse < Internal::Types::Model
          field :errors, -> { Internal::Types::Array[FernExhaustive::Endpoints::Put::Types::Error] }, optional: true, nullable: false
        end
      end
    end
  end
end
