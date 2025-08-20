using Microsoft.AspNetCore.Mvc;

public class ProductsController : Controller
{
    private readonly CatalogService _catalog;
    private readonly CartService _cart;

    public ProductsController(CatalogService catalog, CartService cart)
    {
        _catalog = catalog;
        _cart = cart;
    }

    public IActionResult Index() => View(_catalog.All());

    [HttpPost]
    public IActionResult AddToCart(int id, int qty = 1)
    {
        _cart.Add(id, qty);
        return RedirectToAction("Index", "Products");
    }
}