# frozen_string_literal: true

module FernOauthClientCredentials
  module Internal
    module Types
      module Unknown
        include FernOauthClientCredentials::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
