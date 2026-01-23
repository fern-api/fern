using SystemTask = global::System.Threading.Tasks.Task;

namespace SeedOauthClientCredentials.Core;

public interface IExceptionInterceptor
{
    Exception Intercept(Exception exception);
}

internal class ExceptionHandler
{
    private readonly IExceptionInterceptor? _interceptor;

    public ExceptionHandler(IExceptionInterceptor? interceptor)
    {
        _interceptor = interceptor;
    }

    internal void TryCatch(Action action)
    {
        if (_interceptor is null)
        {
            action();
            return;
        }

        try
        {
            action();
        }
        catch (Exception ex)
        {
            throw _interceptor.Intercept(ex);
        }
    }

    internal T TryCatch<T>(Func<T> func)
    {
        if (_interceptor is null)
        {
            return func();
        }

        try
        {
            return func();
        }
        catch (Exception ex)
        {
            throw _interceptor.Intercept(ex);
        }
    }

    internal async SystemTask TryCatchAsync(Func<Task> func)
    {
        if (_interceptor is null)
        {
            await func().ConfigureAwait(false);
            return;
        }

        try
        {
            await func().ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            throw _interceptor.Intercept(ex);
        }
    }

    internal async Task<T> TryCatchAsync<T>(Func<Task<T>> func)
    {
        if (_interceptor is null)
        {
            return await func().ConfigureAwait(false);
        }

        try
        {
            return await func().ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            throw _interceptor.Intercept(ex);
        }
    }

    internal void CaptureException(Exception exception)
    {
        _interceptor?.Intercept(exception);
    }

    internal ExceptionHandler Clone() => new ExceptionHandler(_interceptor);
}
