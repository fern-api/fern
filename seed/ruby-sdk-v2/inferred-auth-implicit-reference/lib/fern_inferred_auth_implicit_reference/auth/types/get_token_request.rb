# frozen_string_literal: true

module FernInferredAuthImplicitReference
  module Auth
    module Types
      # A request to obtain an OAuth token.
      class GetTokenRequest < Internal::Types::Model
        field :client_id, -> { String }, optional: false, nullable: false
        field :client_secret, -> { String }, optional: false, nullable: false
        field :audience, -> { String }, optional: false, nullable: false
        field :grant_type, -> { String }, optional: false, nullable: false
        field :scope, -> { String }, optional: true, nullable: false
      end
    end
  end
end
