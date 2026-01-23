# frozen_string_literal: true

module FernExhaustive
  module Endpoints
    module Put
      module Types
        class Error < Internal::Types::Model
          field :category, -> { FernExhaustive::Endpoints::Put::Types::ErrorCategory }, optional: false, nullable: false
          field :code, -> { FernExhaustive::Endpoints::Put::Types::ErrorCode }, optional: false, nullable: false
          field :detail, -> { String }, optional: true, nullable: false
          field :field, -> { String }, optional: true, nullable: false
        end
      end
    end
  end
end
