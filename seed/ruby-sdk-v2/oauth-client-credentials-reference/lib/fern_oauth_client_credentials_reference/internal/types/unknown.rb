# frozen_string_literal: true

module FernOauthClientCredentialsReference
  module Internal
    module Types
      module Unknown
        include FernOauthClientCredentialsReference::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
