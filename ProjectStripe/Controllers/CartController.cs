using Microsoft.AspNetCore.Mvc;

public class CartController : Controller
{
    private readonly CatalogService _catalog;
    private readonly CartService _cart;

    public CartController(CatalogService catalog, CartService cart)
    {
        _catalog = catalog;
        _cart = cart;
    }
    public IActionResult Index()
    {
        var items = _cart.Get()
            .Select(i => new
            {
                Item = i,
                Product = _catalog.Find(i.ProductId),
                LineTotal = (_catalog.Find(i.ProductId)?.UnitAmount ?? 0) * i.Qty
            })
            .ToList();

        var total = items.Sum(x => x.LineTotal);
        ViewBag.Total = total;
        return View(items);
    }

    [HttpPost]
    public IActionResult Remove(int id)
    {
        _cart.Remove(id);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public IActionResult Clear()
    {
        _cart.Clear();
        return RedirectToAction(nameof(Index));
    }
}
