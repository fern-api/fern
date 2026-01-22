# frozen_string_literal: true

module FernMultiUrlEnvironment
  class Environment
    PRODUCTION = { ec_2: "https://ec2.aws.com", s_3: "https://s3.aws.com" }.freeze
    STAGING = { ec_2: "https://staging.ec2.aws.com", s_3: "https://staging.s3.aws.com" }.freeze
  end
end
