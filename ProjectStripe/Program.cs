using Stripe;
using Stripe.Checkout;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_API_KEY");


builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();





// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/", () => "Stripe + .NET listo");

app.MapPost("/create-checkout-session", () =>
{
    var options = new SessionCreateOptions
    {
        Mode = "payment",
        SuccessUrl = "https://localhost:7103/success?session_id={CHECKOUT_SESSION_ID}",
        CancelUrl = "https://localhost:7103/cancel",
        LineItems = new List<SessionLineItemOptions>
        {
            new()
            {
                Quantity = 1,
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    UnitAmount = 1999, // 19.99 USD en centavos
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = "Producto de prueba"
                    }
                }
            }
        }
    };

    var service = new SessionService();
    var session = service.Create(options);
    return Results.Ok(new { url = session.Url });
});

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
