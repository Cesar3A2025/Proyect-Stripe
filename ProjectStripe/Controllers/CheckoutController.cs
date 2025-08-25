using Microsoft.AspNetCore.Mvc;
using Stripe;

public class CheckoutController : Controller
{
    private readonly CatalogService _catalog;
    private readonly CartService _cart;

    public CheckoutController(CatalogService catalog, CartService cart)
    {
        _catalog = catalog; _cart = cart;
    }

    [HttpGet]
    public IActionResult Index()
    {
        ViewBag.PublishableKey = Environment.GetEnvironmentVariable("STRIPE_PUBLISHABLE_KEY_C");
        return View();
    }

    // Devuelve client_secret desde el monto del carrito
    [HttpPost]
    [IgnoreAntiforgeryToken]
    public IActionResult CreatePaymentIntent()
    {
        var items = _cart.Get()
            .Select(i => new { Product = _catalog.Find(i.ProductId)!, Qty = i.Qty })
            .ToList();

        if (!items.Any()) return BadRequest("El carrito está vacío.");

        var currency = items.First().Product.Currency;
        var amount = items.Sum(x => x.Product.UnitAmount * x.Qty);

        var options = new PaymentIntentCreateOptions
        {
            Amount = amount,
            Currency = currency,
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
            Metadata = new Dictionary<string, string> { ["cart"] = string.Join(",", items.Select(i => $"{i.Product.Id}x{i.Qty}")) }
        };
        var service = new PaymentIntentService();
        var intent = service.Create(options);

        return Json(new { clientSecret = intent.ClientSecret });
    }


    public ContentResult Success() => Content("<h1 style='font-family:sans-serif'>Pago completado</h1>", "text/html");
    public ContentResult Cancel() => Content("<h1 style='font-family:sans-serif'>Pago cancelado</h1>", "text/html");
}
