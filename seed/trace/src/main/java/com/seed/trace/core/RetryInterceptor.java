package com.seed.trace.core;

import java.io.IOException;
import java.time.Duration;
import java.util.Optional;
import java.util.Random;
import okhttp3.Interceptor;
import okhttp3.Response;

public class RetryInterceptor implements Interceptor {

    private final ExponentialBackoff backoff;

    public RetryInterceptor(int maxRetries) {
        this.backoff = new ExponentialBackoff(maxRetries);
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        Optional<Duration> nextBackoff = this.backoff.nextBackoff();

        while (nextBackoff.isPresent()) {
            try {
                Thread.sleep(nextBackoff.get().toMillis());
            } catch (InterruptedException e) {
                throw new IOException("Interrupted while trying request", e);
            }
            Response response = chain.proceed(chain.request());
            if (response.isSuccessful()) {
                return response;
            }
            nextBackoff = this.backoff.nextBackoff();
        }

        throw new IOException("Max retries reached");
    }

    private static final class ExponentialBackoff {

        private static final Duration ONE_SECOND = Duration.ofSeconds(1);

        private final int maxNumRetries;
        private final Random random = new Random();

        private int retryNumber = 0;

        ExponentialBackoff(int maxNumRetries) {
            this.maxNumRetries = maxNumRetries;
        }

        public Optional<Duration> nextBackoff() {
            retryNumber += 1;
            if (retryNumber > maxNumRetries) {
                return Optional.empty();
            }

            int upperBound = (int) Math.pow(2, retryNumber);
            return Optional.of(ONE_SECOND.multipliedBy(random.nextInt(upperBound)));
        }
    }
}
