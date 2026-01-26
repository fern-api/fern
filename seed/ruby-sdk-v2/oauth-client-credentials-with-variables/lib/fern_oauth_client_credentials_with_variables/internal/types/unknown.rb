# frozen_string_literal: true

module FernOauthClientCredentialsWithVariables
  module Internal
    module Types
      module Unknown
        include FernOauthClientCredentialsWithVariables::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
