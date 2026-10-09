# frozen_string_literal: true

module Seed
  module Auth
    module Types
      class GetTokenResponse < Internal::Types::Model
        field :access_token, -> { String }, optional: true, nullable: false
      end
    end
  end
end
