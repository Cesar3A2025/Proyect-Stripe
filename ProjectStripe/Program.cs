using Microsoft.AspNetCore.Mvc;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_API_KEY_C");

// 2) MVC + Session + DI
builder.Services.AddDistributedMemoryCache();
builder.Services.AddControllersWithViews();
builder.Services.AddSession(o =>
{
    o.Cookie.Name = ".ProjectStripe.Session";
    o.IdleTimeout = TimeSpan.FromMinutes(60);
});


// Servicios propios
builder.Services.AddSingleton<CatalogService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddHttpContextAccessor();


// (Opcional) Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseSession();

app.UseDefaultFiles();
app.UseStaticFiles();

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Rutas MVC (por defecto: /Products/Index)
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Products}/{action=Index}/{id?}"
);

app.Run();
