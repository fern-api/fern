# frozen_string_literal: true

module Seed
  module Auth
    module Types
      class GetTokenAuthRequest < Internal::Types::Model
        field :audience, -> { Seed::Auth::Types::GetTokenAuthRequestAudience }, optional: true, nullable: false

        field :client_id, -> { String }, optional: false, nullable: false

        field :client_secret, -> { String }, optional: false, nullable: false

        field :scopes, -> { String }, optional: false, nullable: false

        field :grant_type, -> { Seed::Auth::Types::GetTokenAuthRequestGrantType }, optional: false, nullable: false

        field :tenant, -> { String }, optional: false, nullable: false

        field :optional_hint, -> { String }, optional: true, nullable: false
      end
    end
  end
end
