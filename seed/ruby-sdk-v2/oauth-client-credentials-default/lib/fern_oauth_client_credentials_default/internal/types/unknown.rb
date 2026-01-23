# frozen_string_literal: true

module FernOauthClientCredentialsDefault
  module Internal
    module Types
      module Unknown
        include FernOauthClientCredentialsDefault::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
